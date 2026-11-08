#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")/.."

TOKEN=$(curl -fsS --max-time 5 -X PUT \
  "http://169.254.169.254/latest/api/token" \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 60")

IP=$(curl -fsS --max-time 5 \
  -H "X-aws-ec2-metadata-token: $TOKEN" \
  "http://169.254.169.254/latest/meta-data/public-ipv4")

printf 'const API_URL = "http://%s:5000";\n' "$IP" \
  > frontend/config.js

echo "Configuração atualizada com sucesso!"
echo "IPv4 público: $IP"
