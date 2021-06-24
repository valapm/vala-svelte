FROM node:16 AS build

WORKDIR /code

COPY package.json ./
COPY package-lock.json ./
RUN npm install
COPY . ./
RUN npm run build

FROM nginx:1.19-alpine
COPY --from=build /code/public /usr/share/nginx/html