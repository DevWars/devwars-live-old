FROM node:slim

WORKDIR /app

ADD package.json .
ADD package-lock.json .

RUN npm ci

ADD . /app

RUN npm run build

EXPOSE 8000

CMD DEVWARS_URL=${DEVWARS_URL} FIREBASE_DATABASE_URL=https://${FIREBASE_ID}.firebaseio.com npm start
