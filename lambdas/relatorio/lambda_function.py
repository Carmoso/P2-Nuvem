import os
import json
import logging
import psycopg
from psycopg.rows import dict_row

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

SQL_RELATORIO = """
SELECT
    a.id AS auditorio_id,
    a.nome AS auditorio,
    a.capacidade,
    a.localizacao,
    COUNT(e.id) AS total_eventos,
    COUNT(e.id) FILTER (
        WHERE e.status = 'agendado'
    ) AS eventos_agendados,
    COUNT(e.id) FILTER (
        WHERE e.status = 'finalizado'
    ) AS eventos_finalizados,
    COUNT(e.id) FILTER (
        WHERE e.status = 'cancelado'
    ) AS eventos_cancelados
FROM auditorios a
LEFT JOIN eventos e
    ON e.auditorio_id = a.id
GROUP BY
    a.id, a.nome, a.capacidade, a.localizacao
ORDER BY
    total_eventos DESC, a.nome
"""

def lambda_handler(event, context):
    try:
        with psycopg.connect(
            host=os.environ["DB_HOST"],
            port=os.environ.get("DB_PORT", "5432"),
            dbname=os.environ["DB_NAME"],
            user=os.environ["DB_USER"],
            password=os.environ["DB_PASSWORD"],
            connect_timeout=10,
            row_factory=dict_row
        ) as conexao:
            with conexao.cursor() as cursor:
                cursor.execute(SQL_RELATORIO)
                resultados = cursor.fetchall()

        resposta = {
            "total_auditorios": len(resultados),
            "auditorios": resultados
        }

        logger.info("Relatorio gerado com sucesso.")

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": json.dumps(resposta, ensure_ascii=False)
        }

    except Exception:
        logger.exception("Erro ao gerar relatorio.")

        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": json.dumps({
                "erro": "Falha ao gerar relatorio."
            })
        }
