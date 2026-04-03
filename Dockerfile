FROM node:22-bookworm-slim AS build

WORKDIR /app

RUN corepack enable && corepack prepare npm@11.12.1 --activate

COPY package.json package-lock.json ./
RUN corepack npm ci

COPY . .
RUN corepack npm run build

FROM node:22-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000
ENV PORT=3000

COPY --from=build /app/.output ./.output

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
