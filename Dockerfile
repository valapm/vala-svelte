FROM node:16.6-alpine3.14 AS build

WORKDIR /code

ARG BACKEND_HOST
ARG BACKEND_HOST_TESTNET
ARG GRAPHQL_HOST
ARG GRAPHQL_HOST_TESTNET
ARG GRAPHQL_WS_HOST
ARG GRAPHQL_WS_HOST_TESTNET
ARG AUTH_HOST

COPY package.json ./
COPY package-lock.json ./
RUN npm install
COPY . ./
RUN npm run build

FROM nginx:1.19-alpine
COPY --from=build /code/public /usr/share/nginx/html
COPY nginx/mime.types /etc/nginx/