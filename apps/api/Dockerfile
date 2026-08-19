FROM node:22-alpine

WORKDIR /app

# Install workspace deps (types package is TS source, no build step needed)
COPY package.json package-lock.json* ./
COPY apps/api ./apps/api
COPY packages ./packages

RUN npm install --workspace @rep/api --include-workspace-root

WORKDIR /app/apps/api
ENV NODE_ENV=production
EXPOSE 4000
CMD ["npx", "tsx", "src/index.ts"]
