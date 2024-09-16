FROM oven/bun:1-debian AS builder

RUN bun install
RUN bun build

FROM caddy:2.8

COPY --from=builder /app/dist /usr/share/caddy
COPY Caddyfile /etc/caddy/Caddyfile

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
