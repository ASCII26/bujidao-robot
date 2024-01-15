# 指定基础镜像版本，确保每次构建都是幂等的
FROM node:16

RUN corepack enable && corepack prepare pnpm@7.6.0 --activate

WORKDIR /app

COPY .npmrc pnpm-lock.yaml ./

# 将本地文件复制到构建上下文
COPY . .

RUN pnpm install --no-frozen-lockfile
CMD ["pnpm", "serve:bot"]