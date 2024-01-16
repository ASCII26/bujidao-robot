FROM node:18 AS BUILD_IMAGE

RUN npm i -g pnpm@8

WORKDIR /app

COPY package*.json .npmrc ./

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