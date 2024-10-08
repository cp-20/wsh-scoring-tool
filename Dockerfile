FROM oven/bun:1-debian AS base

WORKDIR /app
COPY . /app/
RUN bun install
RUN bun --filter "@wsh-scoring-tool/lb-frontend" build-only

WORKDIR /app/packages/lb-server

RUN cat <<EOF > start.sh
#!/bin/bash
set -e
bunx prisma migrate deploy
bunx prisma generate
bunx prisma generate --sql
PUBLIC_DIR=../lb-frontend/dist bun run start
EOF

RUN chmod +x start.sh

CMD ["./start.sh"]
