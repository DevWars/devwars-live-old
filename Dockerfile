FROM node:8-slim

WORKDIR /app

ADD package.json .

RUN yarn

ADD . /app

RUN npm run build

EXPOSE 8000

CMD DEVWARS_URL=${DEVWARS_URL} FIREBASE_DATABASE_URL=https://${FIREBASE_ID}.firebaseio.com npm start
