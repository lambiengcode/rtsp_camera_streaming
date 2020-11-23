FROM node:14.15.1-alpine
WORKDIR /var/run/app
COPY . .
RUN yarn
CMD ["yarn", "start"]