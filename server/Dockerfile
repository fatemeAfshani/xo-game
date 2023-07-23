FROM node:alpine as development

WORKDIR /usr/src/app

COPY ./package.json ./yarn.lock ./

RUN yarn install --production=false

COPY . .
EXPOSE 4000

CMD ["npm", "start"]

# FROM node:alpine as production

# ARG NODE_ENV=production
# ENV NODE_ENV=${NODE_ENV}

# WORKDIR /usr/src/app

# COPY ./server/package.json ./
# COPY ./server/yarn.lock ./

# RUN yarn install --production

# COPY . .

# COPY --from=development /usr/src/app/dist ./dist

# CMD ["node", "dist/main"]