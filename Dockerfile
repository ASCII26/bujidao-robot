# 指定基础镜像版本，确保每次构建都是幂等的
FROM node:18-alpine AS base
FROM base AS builder

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

# Node v16.13 开始支持 corepack 用于管理第三方包管理器
# 锁定包管理器版本，确保 CI 每次构建都是幂等的
# RUN corepack enable && corepack prepare pnpm@latest --activate
RUN corepack enable && corepack prepare pnpm@8.5.0 --activate

WORKDIR /app

COPY .npmrc pnpm-lock.yaml ./

RUN pnpm fetch
# 将本地文件复制到构建上下文
COPY . .

RUN pnpm install --offline --force
RUN pnpm serve:bot


