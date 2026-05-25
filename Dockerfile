from node:18-alpine
env node_env=production

# add pnpm natively to the core docker environment build layer
run corepack enable && corepack prepare pnpm@latest --activate

expose 8080/tcp
workdir /app

# pull down your real pnpm configuration file layout
copy ["package.json", "pnpm-lock.yaml", "./"]

run apk add --upgrade --no-cache python3 make g++
run pnpm install --prod

copy . .
entrypoint [ "node" ]
cmd ["src/index.js"]
