FROM node:22-alpine

WORKDIR /app
ENV PORT=3000

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

EXPOSE 3000

CMD ["yarn", "start"]
