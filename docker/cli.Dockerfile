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
ARG LLM_TOOLS_BUILD_APP_NAME=llm-tools
ENV LLM_TOOLS_BUILD_APP_NAME=${LLM_TOOLS_BUILD_APP_NAME}
ARG LLM_TOOLS_BUILD_APP_VERSION=
RUN [ -n "$LLM_TOOLS_BUILD_APP_VERSION" ] || (echo "ERROR: LLM_TOOLS_BUILD_APP_VERSION is required" && false)
ENV LLM_TOOLS_BUILD_APP_VERSION=${LLM_TOOLS_BUILD_APP_VERSION}
ARG LLM_TOOLS_BUILD_APP_VERSION_SUFFIX=""
ENV LLM_TOOLS_BUILD_APP_VERSION_SUFFIX=${LLM_TOOLS_BUILD_APP_VERSION_SUFFIX}
RUN yarn install && yarn run build:cli
WORKDIR /app
RUN cp /dist/packages/apps/cli/build/bundle.js ./bundle.js


FROM node:22-alpine AS runner
# https://github.com/opencontainers/image-spec/blob/main/annotations.md
ARG OCI_CREATED
RUN [ -n "$OCI_CREATED" ] || (echo "ERROR: OCI_CREATED is required" && false)
ARG OCI_REVISION
RUN [ -n "$OCI_REVISION" ] || (echo "ERROR: OCI_REVISION is required" && false)
ARG LLM_TOOLS_BUILD_APP_VERSION=
RUN [ -n "$LLM_TOOLS_BUILD_APP_VERSION" ] || (echo "ERROR: LLM_TOOLS_BUILD_APP_VERSION is required" && false)
ARG OCI_VERSION=${LLM_TOOLS_BUILD_APP_VERSION}
ARG OCI_AUTHORS="Louis Brunet"
ARG OCI_URL="https://github.com/louis-brunet/llm-tools"
ARG OCI_DOCUMENTATION="https://github.com/louis-brunet/llm-tools"
ARG OCI_SOURCE="https://github.com/louis-brunet/llm-tools"
ARG OCI_TITLE="llm-tools CLI"
ARG OCI_DESCRIPTION="Docker image for the [llm-tools](https://github.com/louis-brunet/llm-tools) CLI"
LABEL org.opencontainers.image.created=${OCI_CREATED} \
      org.opencontainers.image.authors=${OCI_AUTHORS} \
      org.opencontainers.image.url=${OCI_URL} \
      org.opencontainers.image.documentation=${OCI_DOCUMENTATION} \
      org.opencontainers.image.source=${OCI_SOURCE} \
      org.opencontainers.image.title=${OCI_TITLE} \
      org.opencontainers.image.description=${OCI_DESCRIPTION} \
      org.opencontainers.image.version=${OCI_VERSION} \
      org.opencontainers.image.revision=${OCI_REVISION}
COPY --from=builder /app /app
WORKDIR /app
ENV NODE_ENV=production
ENTRYPOINT [ "node", "bundle.js" ]
