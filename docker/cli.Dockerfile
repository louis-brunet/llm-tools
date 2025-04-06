FROM node:22-alpine AS builder
RUN corepack enable
WORKDIR /dist
COPY ./packages/apps/cli ./packages/apps/cli
COPY ./packages/libs ./packages/libs
COPY ./package.json ./package.json
COPY ./tsconfig.json ./tsconfig.json
COPY ./.yarnrc.yml ./.yarnrc.yml
ENV NODE_ENV=production
ENV APP_VERSION_SUFFIX=
RUN yarn install && yarn run build:cli
WORKDIR /app
RUN cp /dist/packages/apps/cli/build/bundle.js ./bundle.js


FROM node:22-alpine AS runner
COPY --from=builder /app /app
WORKDIR /app
ENV NODE_ENV=production
ENTRYPOINT [ "node", "bundle.js" ]
