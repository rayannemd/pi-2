# Vault (dev) — segredos da Efí Bank

Esta pasta contém o script de seed do Vault e (em runtime local) o
certificado P12 da Efí. **Nada aqui deve ser commitado** — veja `.gitignore`.

## Preparação

1. Copie o `.env.example` da raiz para `.env` e preencha com os valores do
   painel da Efí.
2. Coloque o certificado baixado do painel da Efí em `vault/efi.p12`.
3. Suba o stack: `docker compose up -d vault vault-seed backend`.

O `vault-seed` é idempotente e roda a cada `docker compose up`, repopulando o
KV (necessário porque o Vault em modo `-dev` perde os dados ao reiniciar).
