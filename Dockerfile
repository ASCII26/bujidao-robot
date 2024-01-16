FROM node:18 AS BUILD_IMAGE

RUN corepack enable && corepack prepare pnpm@8 --activate

WORKDIR /app

COPY package*.json ./

RUN pnpm install
COPY . .
RUN pnpm build
RUN pnpm prune --production

FROM node:16-alpine

WORKDIR /app

COPY --from=BUILD_IMAGE /app/package.json .
COPY --from=BUILD_IMAGE /app/dist ./dist
COPY --from=BUILD_IMAGE /app/node_modules ./node_modules

CMD ["node", "dist/server/robot-app.js"]