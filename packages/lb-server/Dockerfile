FROM oven/bun:1-debian

WORKDIR /app
COPY . /app/
RUN bun install

CMD ["bun", "--filter '@wsh-scoring-tool/lb-server'", "start"]
