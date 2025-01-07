FROM amd64/alpine:3.19

RUN apk add nodejs npm

RUN mkdir /backend
WORKDIR /backend

COPY package.json package.json
RUN npm install

COPY config config
COPY controllers controllers
COPY helpers helpers
COPY migrations migrations
COPY models models
COPY routes routes
COPY services services
COPY app.js app.js
COPY server.js server.js

EXPOSE 5194

ENTRYPOINT npm run start

