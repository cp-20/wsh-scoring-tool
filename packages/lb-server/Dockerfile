FROM oven/bun:1-debian

WORKDIR /app
COPY . /app/
RUN bun install

WORKDIR /app/packages/lb-server

RUN bunx prisma generate
RUN bunx prisma generate --sql

CMD ["bun", "run", "start"]
