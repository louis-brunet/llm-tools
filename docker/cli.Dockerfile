FROM node:22-alpine AS builder
RUN corepack enable
WORKDIR /dist
COPY ./packages/apps/cli ./packages/apps/cli
COPY ./packages/libs ./packages/libs
COPY ./package.json ./package.json
COPY ./tsconfig.json ./tsconfig.json
COPY ./.yarnrc.yml ./.yarnrc.yml
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ARG LLM_TOOLS_BUILD_APP_NAME=
ENV LLM_TOOLS_BUILD_APP_NAME=${LLM_TOOLS_BUILD_APP_NAME}
ARG LLM_TOOLS_BUILD_APP_VERSION=
ENV LLM_TOOLS_BUILD_APP_VERSION=${LLM_TOOLS_BUILD_APP_VERSION}
# ARG LLM_TOOLS_BUILD_APP_VERSION_SUFFIX=
ENV LLM_TOOLS_BUILD_APP_VERSION_SUFFIX=${LLM_TOOLS_BUILD_APP_VERSION_SUFFIX}
RUN yarn install && yarn run build:cli
WORKDIR /app
RUN cp /dist/packages/apps/cli/build/bundle.js ./bundle.js


FROM node:22-alpine AS runner
COPY --from=builder /app /app
WORKDIR /app
ENV NODE_ENV=production
ENTRYPOINT [ "node", "bundle.js" ]
