FROM oven/bun:1-debian AS builder

WORKDIR /app
COPY . /app/
RUN bun install
RUN bun --filter "@wsh-scoring-tool/lb-frontend" build-only

FROM caddy:2.8

COPY --from=builder /app/packages/lb-frontend/dist /usr/share/caddy
COPY ./packages/lb-frontend/Caddyfile /etc/caddy/Caddyfile

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
