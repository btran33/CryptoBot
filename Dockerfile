FROM node:16

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app
RUN npm install

COPY . /usr/src/app

ENV NODE_PATH src
ENV NODE_ENV production

ENTRYPOINT [ "node", "index.js" ]
CMD ["--strategy", "simple", "--funds", "100", "--type", "trader"]