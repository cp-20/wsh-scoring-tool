FROM oven/bun:1-debian AS builder

WORKDIR /app
COPY . /app/
RUN bun install
RUN bun --filter "@wsh-scoring-tool/lb-frontend" build

FROM caddy:2.8

COPY --from=builder /app/dist /usr/share/caddy
COPY ./packages/lb-frontend/Caddyfile /etc/caddy/Caddyfile

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
