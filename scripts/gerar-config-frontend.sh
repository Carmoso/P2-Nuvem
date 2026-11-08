#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")/.."

# Consultar o IP publico da EC2 utilizando IMDSv2
TOKEN=$(curl -fsS --max-time 5 -X PUT \
  "http://169.254.169.254/latest/api/token" \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 60")

IP=$(curl -fsS --max-time 5 \
  -H "X-aws-ec2-metadata-token: $TOKEN" \
  "http://169.254.169.254/latest/meta-data/public-ipv4")

# Gerar configuracao do frontend
printf 'const API_URL = "http://%s:5000";\n' "$IP" \
  > frontend/config.js

echo "Configuracao atualizada com sucesso!"
echo "IPv4 publico: $IP"

# Publicar no S3 utilizando o perfil IAM associado a EC2
echo "Publicando config.js no S3..."

env \
  -u AWS_ACCESS_KEY_ID \
  -u AWS_SECRET_ACCESS_KEY \
  -u AWS_SESSION_TOKEN \
  -u AWS_PROFILE \
  -u AWS_DEFAULT_PROFILE \
  AWS_SHARED_CREDENTIALS_FILE=/dev/null \
  AWS_CONFIG_FILE=/dev/null \
  AWS_EC2_METADATA_DISABLED=false \
  AWS_PAGER="" \
  aws s3 cp frontend/config.js \
    s3://p2-nuvem-eventhub-475858528651-2026/config.js \
    --content-type "application/javascript" \
    --cache-control "no-cache" \
    --region us-east-1

echo "Configuracao publicada no S3 com sucesso!"
