FROM node:18-alpine as build

LABEL author="Serhii Dolia <serhii.dolia@gmail.com>"

WORKDIR /mal
COPY . .
RUN npm install
RUN npm run build

FROM node:18-alpine

COPY --from=build mal/stepA_mal.js mal/core.js mal/env.js mal/mal_error.js mal/printer.js mal/reader.js mal/readline.js mal/types.js ./
