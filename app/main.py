import os
from flask import Flask, jsonify, request
import psycopg
import boto3
from psycopg.rows import dict_row
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

S3_BUCKET = "p2-nuvem-eventhub-banners-475858528651-2026"
s3 = boto3.client("s3", region_name="us-east-1")

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
    campos = ("nome", "capacidade", "localizacao", "recursos")
    atual = consultar(
        "SELECT * FROM auditorios WHERE id = %s", (item_id,)
    )
    if not atual:
        return jsonify({"erro": "Auditório não encontrado"}), 404

    valores = [dados.get(c, atual[0][c]) for c in campos]
    item = consultar("""
        UPDATE auditorios
        SET nome=%s, capacidade=%s, localizacao=%s, recursos=%s
        WHERE id=%s RETURNING *
    """, (*valores, item_id))[0]
    return resposta_item(item)

@app.delete("/auditorios/<int:item_id>")
def excluir_auditorio(item_id):
    consultar("DELETE FROM auditorios WHERE id = %s", (item_id,), False)
    return "", 204

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
    obrigatorios = ("titulo", "data_inicio", "data_fim", "auditorio_id")
    if any(campo not in dados for campo in obrigatorios):
        return jsonify({"erro": "Informe titulo, data_inicio, data_fim e auditorio_id"}), 400

    try:
        item = consultar("""
            INSERT INTO eventos
                (titulo, descricao, data_inicio, data_fim, auditorio_id)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING *
        """, (
            dados["titulo"], dados.get("descricao"),
            dados["data_inicio"], dados["data_fim"],
            dados["auditorio_id"]
        ))[0]
        return resposta_item(item), 201
    except (ValueError, TypeError):
        return jsonify({"erro": "Dados inválidos"}), 400

@app.put("/eventos/<int:item_id>")
def atualizar_evento(item_id):
    dados = request.get_json(silent=True) or {}
    atual = consultar(
        "SELECT * FROM eventos WHERE id = %s", (item_id,)
    )
    if not atual:
        return jsonify({"erro": "Evento não encontrado"}), 404

    campos = ("titulo", "descricao", "data_inicio", "data_fim",
              "status", "auditorio_id")
    valores = [dados.get(c, atual[0][c]) for c in campos]
    item = consultar("""
        UPDATE eventos
        SET titulo=%s, descricao=%s, data_inicio=%s, data_fim=%s,
            status=%s, auditorio_id=%s
        WHERE id=%s RETURNING *
    """, (*valores, item_id))[0]
    return resposta_item(item)

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
