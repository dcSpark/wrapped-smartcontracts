FROM node:16-slim AS x-builder
ARG APP=/app
WORKDIR ${APP}
COPY package*.json ./
COPY tsconfig*.json ./
RUN npm ci --package-lock --ignore-scripts

COPY hardhat.config.ts ./
COPY ./tasks ./tasks
COPY ./contracts ./contracts
RUN npm run compile

COPY ./server ./server
ENV NODE_ENV=production
RUN npm run build --ignore-scripts \
    && npm ci --omit=dev --ignore-scripts

########################################################

FROM gcr.io/distroless/nodejs:16 AS server
ENV TZ=Etc/UTC \
    NODE_ENV=production
ARG APP=/app
WORKDIR ${APP}
COPY --from=x-builder ${APP}/build ./build
COPY --from=x-builder ${APP}/node_modules ./node_modules
USER nonroot
CMD ["build/server/index.js"]