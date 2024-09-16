FROM oven/bun:1-debian

RUN bun install

CMD ["bun", "--filter '@wsh-scoring-tool/lb-server'", "start"]
