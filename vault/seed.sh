#!/bin/sh
set -e

echo "[vault-seed] aguardando vault em $VAULT_ADDR..."
until vault status >/dev/null 2>&1; do
  sleep 1
done

if [ ! -f /efi.p12 ]; then
  echo "[vault-seed] /efi.p12 nao encontrado. Coloque o certificado em ./vault/efi.p12 antes de subir."
  exit 1
fi

CERT_B64=$(base64 /efi.p12 | tr -d '\n')

strip_quotes() {
  v="$1"
  v="${v#\"}"; v="${v%\"}"
  v="${v#\'}"; v="${v%\'}"
  printf '%s' "$v"
}

EFI_CLIENT_ID=$(strip_quotes "$EFI_CLIENT_ID")
EFI_CLIENT_SECRET=$(strip_quotes "$EFI_CLIENT_SECRET")
EFI_CERT_PASSWORD=$(strip_quotes "$EFI_CERT_PASSWORD")
EFI_PIX_KEY=$(strip_quotes "$EFI_PIX_KEY")

echo "[vault-seed] habilitando engine kv-v2 (idempotente)..."
vault secrets enable -version=2 -path=secret kv 2>/dev/null || true

echo "[vault-seed] gravando secret/efi-bank..."
vault kv put secret/efi-bank \
  efi-bank.client-id="$EFI_CLIENT_ID" \
  efi-bank.client-secret="$EFI_CLIENT_SECRET" \
  efi-bank.certificate-b64="$CERT_B64" \
  efi-bank.certificate-password="$EFI_CERT_PASSWORD" \
  efi-bank.pix-key="$EFI_PIX_KEY"

echo "[vault-seed] OK."
