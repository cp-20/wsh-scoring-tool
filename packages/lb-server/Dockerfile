FROM oven/bun:1-debian

WORKDIR /app
COPY . /app/
RUN bun install

WORKDIR /app/packages/lb-server

RUN cat <<EOF > start.sh
#!/bin/bash
set -e
bunx prisma generate
bunx prisma generate --sql
bun run start
EOF

RUN chmod +x start.sh

CMD ["./start.sh"]
