FROM oven/bun:1-debian AS base

WORKDIR /app
COPY . /app/
RUN bun install
RUN bun --filter "@wsh-scoring-tool/lb-frontend" build-only

WORKDIR /app/packages/lb-server

RUN bun prisma migrate deploy
RUN bun prisma generate
RUN bun prisma generate --sql

ENV PUBLIC_DIR=../lb-frontend/dist

CMD ["bun", "run", "start"]
