FROM oven/bun:1-debian

WORKDIR /app
COPY . /app/
RUN bun install

WORKDIR /app/packages/lb-server

RUN bunx prisma generate

CMD ["bun", "run", "start"]
