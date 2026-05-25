from node:18-alpine
env node_env=production

# add pnpm natively to the core docker environment build layer
run corepack enable && corepack prepare pnpm@latest --activate

expose 8080/tcp
workdir /app

# pull down your real pnpm configuration file layout
copy ["package.json", "pnpm-lock.yaml", "./"]

<<<<<<< HEAD
run apk add --upgrade --no-cache python3 make g++
run pnpm install --prod
=======
COPY package.json ./
RUN apk add --upgrade --no-cache python3 make g++
RUN $NPM_BUILD
>>>>>>> b1e75390f88c1f8ffefea05155294a6a71cd92e5

copy . .
entrypoint [ "node" ]
cmd ["src/index.js"]
