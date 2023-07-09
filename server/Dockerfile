FROM node:alpine as development

WORKDIR /usr/src/app

COPY ./server/package.json ./
COPY ./server/yarn.lock ./


RUN yarn install

COPY ./server/* ./
EXPOSE 4000

RUN npm  run start:dev

FROM node:alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY ./server/package.json ./
COPY ./server/yarn.lock ./

RUN yarn install --production

COPY . .

COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/main"]