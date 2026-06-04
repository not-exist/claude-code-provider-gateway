FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/daemon/package.json packages/daemon/package.json
COPY packages/panel/package.json packages/panel/package.json
COPY packages/desktop/package.json packages/desktop/package.json

RUN npm ci

COPY tsconfig.json ./
COPY packages/daemon packages/daemon
COPY packages/panel packages/panel

RUN npm run build
RUN npm prune --omit=dev

FROM node:24-alpine AS runtime

ENV NODE_ENV=production \
    CCPG_RUNTIME_MODE=docker \
    CCPG_STORAGE_BACKEND=sqlite \
    CCPG_SQLITE_PATH=/data/ccpg.sqlite \
    CCPG_CONFIG_DIR=/data \
    CC_GATEWAY_BIND_HOST=0.0.0.0

WORKDIR /app

RUN mkdir -p /data && chown node:node /data

COPY --from=build --chown=node:node /app/package.json /app/package-lock.json ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/packages/daemon/package.json ./packages/daemon/package.json
COPY --from=build --chown=node:node /app/packages/daemon/dist ./packages/daemon/dist

USER node

EXPOSE 6767 49250

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.CCPG_PANEL_PORT||6767)+'/api/status').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "packages/daemon/dist/index.js"]
