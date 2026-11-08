from datetime import datetime, timezone
import os
from flask import Flask, jsonify, request
import psycopg
import boto3
from botocore.config import Config
from psycopg.rows import dict_row
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

S3_BUCKET = "p2-nuvem-eventhub-banners-475858528651-2026"
s3 = boto3.client("s3", region_name="us-east-1", config=Config(signature_version="s3v4"))

def conectar():
    return psycopg.connect(
        host=os.environ["DB_HOST"],
        port=os.getenv("DB_PORT", "5432"),
        dbname=os.environ["DB_NAME"],
        user=os.environ["DB_USER"],
        password=os.environ["DB_PASSWORD"],
        sslmode="require",
        row_factory=dict_row
    )

def consultar(sql, valores=(), retornar=True):
    with conectar() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, valores)
            if retornar and cur.description:
                return cur.fetchall()
            return None


def salvar_evento_validado(
    sql, parametros, auditorio_id, inicio, fim,
    status="agendado", ignorar_id=None,
    participantes_previstos=None
):
    inicio = datetime.fromisoformat(inicio) if isinstance(inicio, str) else inicio
    fim = datetime.fromisoformat(fim) if isinstance(fim, str) else fim

    if not isinstance(inicio, datetime) or not isinstance(fim, datetime):
        raise ValueError("Datas inválidas")

    if inicio.tzinfo is not None:
        inicio = inicio.astimezone(timezone.utc).replace(tzinfo=None)

    if fim.tzinfo is not None:
        fim = fim.astimezone(timezone.utc).replace(tzinfo=None)

    # Manter as datas em UTC nas colunas TIMESTAMP do RDS.
    parametros = list(parametros)
    parametros[2] = inicio
    parametros[3] = fim

    if inicio >= fim:
        raise ValueError("A data final deve ser posterior à inicial")

    if status not in ("agendado", "finalizado", "cancelado"):
        raise ValueError("Status inválido")

    if participantes_previstos is not None:
        if (
            isinstance(participantes_previstos, bool)
            or not isinstance(participantes_previstos, (int, str))
            or not str(participantes_previstos).isascii()
            or not str(participantes_previstos).isdigit()
        ):
            raise ValueError("Quantidade de participantes inválida")

        participantes_previstos = int(participantes_previstos)

        if participantes_previstos <= 0:
            raise ValueError("A quantidade deve ser maior que zero")

    indice = -1 if ignorar_id is None else -2
    parametros[indice] = participantes_previstos

    with conectar() as conn:
        with conn.cursor() as cur:
            # Serializa reservas feitas para o mesmo auditório.
            cur.execute(
                "SELECT id, ativo, capacidade FROM auditorios WHERE id = %s FOR UPDATE",
                (auditorio_id,)
            )

            auditorio = cur.fetchone()

            if not auditorio:
                return "auditorio_inexistente", None

            if status != "cancelado":
                if not auditorio["ativo"]:
                    return "auditorio_inativo", None

                if (
                    participantes_previstos is not None
                    and participantes_previstos > auditorio["capacidade"]
                ):
                    return "capacidade_insuficiente", None

                cur.execute("""
                    SELECT id
                    FROM bloqueios_auditorios
                    WHERE auditorio_id = %s
                      AND data_inicio < %s
                      AND data_fim > %s
                    LIMIT 1
                """, (auditorio_id, fim, inicio))

                if cur.fetchone():
                    return "auditorio_bloqueado", None
                cur.execute("""
                    SELECT id
                    FROM eventos
                    WHERE auditorio_id = %s
                      AND status <> 'cancelado'
                      AND data_inicio < %s
                      AND data_fim > %s
                      AND (CAST(%s AS BIGINT) IS NULL OR id <> %s)
                    LIMIT 1
                """, (
                    auditorio_id, fim, inicio,
                    ignorar_id, ignorar_id
                ))

                if cur.fetchone():
                    return "conflito", None

            cur.execute(sql, parametros)
            return "ok", cur.fetchone()


def resposta_item(item):
    return jsonify(dict(item))

@app.get("/")
def inicio():
    return jsonify({"mensagem": "API de Gestão de Eventos e Auditórios"})

@app.get("/auditorios")
def listar_auditorios():
    return jsonify(consultar(
        "SELECT * FROM auditorios ORDER BY id"
    ))

@app.get("/auditorios/<int:item_id>")
def buscar_auditorio(item_id):
    itens = consultar(
        "SELECT * FROM auditorios WHERE id = %s", (item_id,)
    )
    if not itens:
        return jsonify({"erro": "Auditório não encontrado"}), 404
    return resposta_item(itens[0])

@app.post("/auditorios")
def criar_auditorio():
    dados = request.get_json(silent=True) or {}
    obrigatorios = ("nome", "capacidade", "localizacao")
    if any(campo not in dados for campo in obrigatorios):
        return jsonify({"erro": "Informe nome, capacidade e localizacao"}), 400

    try:
        item = consultar("""
            INSERT INTO auditorios (nome, capacidade, localizacao, recursos)
            VALUES (%s, %s, %s, %s)
            RETURNING *
        """, (
            dados["nome"], dados["capacidade"], dados["localizacao"],
            dados.get("recursos")
        ))[0]
        return resposta_item(item), 201
    except (ValueError, TypeError):
        return jsonify({"erro": "Dados inválidos"}), 400

@app.put("/auditorios/<int:item_id>")
def atualizar_auditorio(item_id):
    dados = request.get_json(silent=True) or {}

    if "ativo" in dados and not isinstance(dados["ativo"], bool):
        return jsonify({"erro": "O campo ativo deve ser true ou false"}), 400

    campos = ("nome", "capacidade", "localizacao", "recursos", "ativo")

    atual = consultar(
        "SELECT * FROM auditorios WHERE id = %s", (item_id,)
    )

    if not atual:
        return jsonify({"erro": "Auditório não encontrado"}), 404

    valores = [dados.get(c, atual[0][c]) for c in campos]

    item = consultar("""
        UPDATE auditorios
        SET nome=%s, capacidade=%s, localizacao=%s,
            recursos=%s, ativo=%s
        WHERE id=%s
        RETURNING *
    """, (*valores, item_id))[0]

    return resposta_item(item)


@app.delete("/auditorios/<int:item_id>")
def excluir_auditorio(item_id):
    consultar("DELETE FROM auditorios WHERE id = %s", (item_id,), False)
    return "", 204


def normalizar_data_bloqueio(valor):
    if not isinstance(valor, str) or "T" not in valor:
        raise ValueError("Informe data e horário válidos")

    data = datetime.fromisoformat(
        valor.replace("Z", "+00:00")
    )

    if data.tzinfo is not None:
        data = data.astimezone(timezone.utc).replace(tzinfo=None)

    return data


@app.get("/auditorios/<int:auditorio_id>/bloqueios")
def listar_bloqueios_auditorio(auditorio_id):
    auditorio = consultar(
        "SELECT id FROM auditorios WHERE id = %s",
        (auditorio_id,)
    )

    if not auditorio:
        return jsonify({"erro": "Auditório não encontrado"}), 404

    bloqueios = consultar("""
        SELECT *
        FROM bloqueios_auditorios
        WHERE auditorio_id = %s
        ORDER BY data_inicio
    """, (auditorio_id,))

    return jsonify(bloqueios)


@app.post("/auditorios/<int:auditorio_id>/bloqueios")
def criar_bloqueio_auditorio(auditorio_id):
    dados = request.get_json(silent=True) or {}

    try:
        inicio = normalizar_data_bloqueio(dados["data_inicio"])
        fim = normalizar_data_bloqueio(dados["data_fim"])
    except (KeyError, TypeError, ValueError, OverflowError):
        return jsonify({"erro": "Datas inválidas"}), 400

    if inicio >= fim:
        return jsonify({
            "erro": "A data final deve ser posterior à inicial"
        }), 400

    motivo = dados.get("motivo")

    if motivo is not None and not isinstance(motivo, str):
        return jsonify({"erro": "Motivo inválido"}), 400

    with conectar() as conn:
        with conn.cursor() as cur:

            cur.execute(
                "SELECT id FROM auditorios WHERE id = %s FOR UPDATE",
                (auditorio_id,)
            )

            if not cur.fetchone():
                return jsonify({
                    "erro": "Auditório não encontrado"
                }), 404

            cur.execute("""
                SELECT id FROM eventos
                WHERE auditorio_id = %s
                  AND status <> 'cancelado'
                  AND data_inicio < %s
                  AND data_fim > %s
                LIMIT 1
            """, (auditorio_id, fim, inicio))

            if cur.fetchone():
                return jsonify({
                    "erro": "Existe um evento nesse período."
                }), 409

            cur.execute("""
                SELECT id FROM bloqueios_auditorios
                WHERE auditorio_id = %s
                  AND data_inicio < %s
                  AND data_fim > %s
                LIMIT 1
            """, (auditorio_id, fim, inicio))

            if cur.fetchone():
                return jsonify({
                    "erro": "Já existe um bloqueio nesse período."
                }), 409

            cur.execute("""
                INSERT INTO bloqueios_auditorios
                    (auditorio_id, data_inicio, data_fim, motivo)
                VALUES (%s, %s, %s, %s)
                RETURNING *
            """, (auditorio_id, inicio, fim, motivo))

            bloqueio = cur.fetchone()

    return resposta_item(bloqueio), 201


@app.delete("/bloqueios/<int:bloqueio_id>")
def excluir_bloqueio_auditorio(bloqueio_id):
    registros = consultar("""
        DELETE FROM bloqueios_auditorios
        WHERE id = %s
        RETURNING id
    """, (bloqueio_id,))

    if not registros:
        return jsonify({"erro": "Bloqueio não encontrado"}), 404

    return "", 204



@app.get("/auditorios/disponiveis")
def consultar_auditorios_disponiveis():
    inicio_texto = request.args.get("data_inicio")
    fim_texto = request.args.get("data_fim")
    capacidade_texto = request.args.get("capacidade")

    if not inicio_texto or not fim_texto or not capacidade_texto:
        return jsonify({
            "erro": "Informe data_inicio, data_fim e capacidade."
        }), 400

    try:
        inicio = normalizar_data_bloqueio(inicio_texto)
        fim = normalizar_data_bloqueio(fim_texto)

        capacidade = int(capacidade_texto)

        if capacidade <= 0 or capacidade > 2147483647:
            raise ValueError("Capacidade inválida")

    except (ValueError, TypeError, OverflowError):
        return jsonify({
            "erro": "Informe datas e capacidade válidas."
        }), 400

    if inicio >= fim:
        return jsonify({
            "erro": "A data de término deve ser posterior à de início."
        }), 400

    auditorios = consultar("""
        SELECT a.*
        FROM auditorios a
        WHERE a.ativo = TRUE
          AND a.capacidade >= %s

          AND NOT EXISTS (
              SELECT 1
              FROM eventos e
              WHERE e.auditorio_id = a.id
                AND e.status <> 'cancelado'
                AND e.data_inicio < %s
                AND e.data_fim > %s
          )

          AND NOT EXISTS (
              SELECT 1
              FROM bloqueios_auditorios b
              WHERE b.auditorio_id = a.id
                AND b.data_inicio < %s
                AND b.data_fim > %s
          )

        ORDER BY a.capacidade, a.nome
    """, (
        capacidade,
        fim, inicio,
        fim, inicio
    ))

    if not auditorios:
        return jsonify({
            "auditorios": [],
            "mensagem": "Nenhum auditório disponível para esse período."
        })

    return jsonify({
        "auditorios": auditorios,
        "mensagem": f"{len(auditorios)} auditório(s) disponível(is)."
    })


@app.get("/eventos/<int:evento_id>/imagem-url")
def obter_url_imagem_evento(evento_id):
    registros = consultar(
        """
        SELECT banner_url, thumbnail_url
        FROM eventos
        WHERE id = %s
        """,
        (evento_id,)
    )

    if not registros:
        return jsonify({"erro": "Evento não encontrado"}), 404

    evento = registros[0]

    chave = evento["thumbnail_url"] or evento["banner_url"]

    if not chave:
        return jsonify({"erro": "Evento sem imagem"}), 404

    url = s3.generate_presigned_url(
        "get_object",
        Params={
            "Bucket": S3_BUCKET,
            "Key": chave
        },
        ExpiresIn=900
    )

    return jsonify({"url": url})

@app.get("/eventos")
def listar_eventos():
    return jsonify(consultar("""
        SELECT e.*, a.nome AS auditorio_nome
        FROM eventos e
        JOIN auditorios a ON a.id = e.auditorio_id
        ORDER BY e.id
    """))

@app.post("/eventos/<int:evento_id>/banner-url")
def gerar_url_banner(evento_id):
    evento = consultar(
        "SELECT id FROM eventos WHERE id = %s",
        (evento_id,)
    )

    if not evento:
        return jsonify({"erro": "Evento não encontrado"}), 404

    dados = request.get_json(silent=True) or {}
    nome_arquivo = dados.get("nome_arquivo", "")
    tipo_arquivo = dados.get("tipo_arquivo", "")

    tipos_permitidos = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp"
    }

    if tipo_arquivo not in tipos_permitidos:
        return jsonify({"erro": "Formato de imagem não permitido"}), 400

    if not nome_arquivo:
        return jsonify({"erro": "Informe o nome do arquivo"}), 400

    extensao = tipos_permitidos[tipo_arquivo]
    chave = f"uploads/evento_{evento_id}.{extensao}"

    url = s3.generate_presigned_url(
        "put_object",
        Params={
            "Bucket": S3_BUCKET,
            "Key": chave,
            "ContentType": tipo_arquivo
        },
        ExpiresIn=300
    )

    return jsonify({
        "url": url,
        "chave": chave,
        "banner_url": chave
    })

@app.post("/eventos/<int:evento_id>/banner-upload")
def enviar_banner_evento(evento_id):
    evento = consultar(
        "SELECT id FROM eventos WHERE id = %s",
        (evento_id,)
    )

    if not evento:
        return jsonify({"erro": "Evento não encontrado"}), 404

    arquivo = request.files.get("arquivo")

    if not arquivo or not arquivo.filename:
        return jsonify({"erro": "Selecione uma imagem"}), 400

    tipos_permitidos = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp"
    }

    tipo = arquivo.mimetype

    if tipo not in tipos_permitidos:
        return jsonify({"erro": "Formato de imagem não permitido"}), 400

    extensao = tipos_permitidos[tipo]
    chave = f"uploads/evento_{evento_id}.{extensao}"

    s3.upload_fileobj(
        arquivo,
        S3_BUCKET,
        chave,
        ExtraArgs={"ContentType": tipo}
    )

    consultar(
        "UPDATE eventos SET banner_url = %s WHERE id = %s",
        (chave, evento_id),
        False
    )

    return jsonify({
        "mensagem": "Banner enviado com sucesso",
        "banner_url": chave
    }), 200

@app.get("/eventos/<int:item_id>")
def buscar_evento(item_id):
    itens = consultar("""
        SELECT e.*, a.nome AS auditorio_nome
        FROM eventos e
        JOIN auditorios a ON a.id = e.auditorio_id
        WHERE e.id = %s
    """, (item_id,))
    if not itens:
        return jsonify({"erro": "Evento não encontrado"}), 404
    return resposta_item(itens[0])

@app.post("/eventos")
def criar_evento():
    dados = request.get_json(silent=True) or {}
    obrigatorios = (
        "titulo", "data_inicio", "data_fim",
        "auditorio_id", "participantes_previstos"
    )

    if any(dados.get(campo) in (None, "") for campo in obrigatorios):
        return jsonify({
            "erro": "Informe título, datas, auditório e participantes previstos."
        }), 400

    try:
        auditorio_id = int(dados["auditorio_id"])

        sql = """
            INSERT INTO eventos
                (titulo, descricao, data_inicio, data_fim, auditorio_id, participantes_previstos)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING *
        """

        parametros = (
            dados["titulo"],
            dados.get("descricao"),
            dados["data_inicio"],
            dados["data_fim"],
            auditorio_id,
            dados.get("participantes_previstos")
        )

        resultado, item = salvar_evento_validado(
            sql, parametros,
            auditorio_id,
            dados["data_inicio"],
            dados["data_fim"],
            participantes_previstos=dados.get("participantes_previstos")
        )

        if resultado == "conflito":
            return jsonify({
                "erro": "O auditório já possui um evento nesse período."
            }), 409

        if resultado == "auditorio_inexistente":
            return jsonify({"erro": "Auditório não encontrado"}), 404

        if resultado == "auditorio_inativo":
            return jsonify({
                "erro": "Este auditório está desativado."
            }), 409

        if resultado == "auditorio_bloqueado":
            return jsonify({
                "erro": "O auditório está bloqueado nesse período."
            }), 409

        if resultado == "capacidade_insuficiente":
            return jsonify({
                "erro": "A quantidade de participantes excede a capacidade do auditório."
            }), 409

        return resposta_item(item), 201

    except (ValueError, TypeError):
        return jsonify({"erro": "Dados ou datas inválidos"}), 400


@app.put("/eventos/<int:item_id>")
def atualizar_evento(item_id):
    dados = request.get_json(silent=True) or {}

    atual = consultar(
        "SELECT * FROM eventos WHERE id = %s",
        (item_id,)
    )

    if not atual:
        return jsonify({"erro": "Evento não encontrado"}), 404

    campos = (
        "titulo", "descricao", "data_inicio",
        "data_fim", "status", "auditorio_id",
        "participantes_previstos"
    )

    valores = [dados.get(c, atual[0][c]) for c in campos]

    try:
        valores[5] = int(valores[5])

        sql = """
            UPDATE eventos
            SET titulo=%s, descricao=%s, data_inicio=%s,
                data_fim=%s, status=%s, auditorio_id=%s,
                  participantes_previstos=%s
            WHERE id=%s
            RETURNING *
        """

        resultado, item = salvar_evento_validado(
            sql,
            (*valores, item_id),
            valores[5],
            valores[2],
            valores[3],
            status=valores[4],
            ignorar_id=item_id,
            participantes_previstos=valores[6]
        )

        if resultado == "conflito":
            return jsonify({
                "erro": "O auditório já possui um evento nesse período."
            }), 409

        if resultado == "auditorio_inexistente":
            return jsonify({"erro": "Auditório não encontrado"}), 404

        if resultado == "auditorio_inativo":
            return jsonify({
                "erro": "Este auditório está desativado."
            }), 409

        if resultado == "auditorio_bloqueado":
            return jsonify({
                "erro": "O auditório está bloqueado nesse período."
            }), 409

        if resultado == "capacidade_insuficiente":
            return jsonify({
                "erro": "A quantidade de participantes excede a capacidade do auditório."
            }), 409

        if not item:
            return jsonify({"erro": "Evento não encontrado"}), 404

        return resposta_item(item)

    except (ValueError, TypeError):
        return jsonify({"erro": "Dados ou datas inválidos"}), 400


@app.put("/eventos/<int:item_id>/banner")
def atualizar_banner_evento(item_id):
    dados = request.get_json(silent=True) or {}
    banner_url = dados.get("banner_url", "")

    if not banner_url.startswith(f"uploads/evento_{item_id}."):
        return jsonify({"erro": "Caminho do banner inválido"}), 400

    item = consultar(
        """
        UPDATE eventos
        SET banner_url = %s
        WHERE id = %s
        RETURNING *
        """,
        (banner_url, item_id)
    )

    if not item:
        return jsonify({"erro": "Evento não encontrado"}), 404

    return resposta_item(item[0])

@app.delete("/eventos/<int:item_id>")
def excluir_evento(item_id):
    consultar("DELETE FROM eventos WHERE id = %s", (item_id,), False)
    return "", 204

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
