import os
import re
import io
import urllib.parse

import boto3
import psycopg
from PIL import Image

s3 = boto3.client("s3")


def process_image(bucket, key):
    # Aceita somente arquivos dentro de uploads/
    if not key.startswith("uploads/"):
        print(f"Arquivo ignorado: {key}")
        return

    # Extrai o ID do evento do nome: uploads/evento_123.jpg
    match = re.search(r"evento_(\d+)\.[a-zA-Z0-9]+$", key)

    if not match:
        print(f"Nome de arquivo fora do padrão: {key}")
        return

    evento_id = int(match.group(1))

    # Baixa a imagem original
    response = s3.get_object(Bucket=bucket, Key=key)
    image_data = response["Body"].read()

    # Gera miniatura em WebP, mantendo a proporção
    with Image.open(io.BytesIO(image_data)) as image:
        image.thumbnail((400, 400))
        image = image.convert("RGB")

        output = io.BytesIO()
        image.save(output, format="WEBP", quality=80)
        output.seek(0)

    # Salva em prefixo separado para evitar recursão
    thumbnail_key = f"thumbnails/evento_{evento_id}.webp"

    s3.put_object(
        Bucket=bucket,
        Key=thumbnail_key,
        Body=output.getvalue(),
        ContentType="image/webp"
    )

    # Atualiza o endereço da miniatura no RDS
    with psycopg.connect(
        host=os.environ["DB_HOST"],
        port=os.environ.get("DB_PORT", "5432"),
        dbname=os.environ["DB_NAME"],
        user=os.environ["DB_USER"],
        password=os.environ["DB_PASSWORD"],
        connect_timeout=10
    ) as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                UPDATE eventos
                SET thumbnail_url = %s
                WHERE id = %s
                """,
                (thumbnail_key, evento_id)
            )

            if cursor.rowcount == 0:
                raise ValueError(f"Evento {evento_id} não encontrado no banco.")

    print(f"Miniatura criada: s3://{bucket}/{thumbnail_key}")
    print(f"Evento atualizado: {evento_id}")


def lambda_handler(event, context):
    for record in event.get("Records", []):
        bucket = record["s3"]["bucket"]["name"]
        key = urllib.parse.unquote_plus(record["s3"]["object"]["key"])

        process_image(bucket, key)

    return {
        "statusCode": 200,
        "body": "Processamento concluído."
    }
