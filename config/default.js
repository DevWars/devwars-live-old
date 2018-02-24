require('dotenv').config();
const serviceAccountKey = require('./serviceAccountKey.json');

const {
    PORT = 8000,
    SOCKET_URL = '',
    DEVWARS_URL,
    FIREBASE_DATABASE_URL,
} = process.env;

module.exports = {
    port: PORT,

    devwars: {
        url: DEVWARS_URL,
    },

    firebase: {
        serviceAccount: serviceAccountKey,
        databaseURL: FIREBASE_DATABASE_URL,
    },

    socketUrl: SOCKET_URL,

    editors: [
        { team: 'blue', language: 'html', filename: 'index.html' },
        { team: 'blue', language: 'css', filename: 'game.css' },
        { team: 'blue', language: 'js', filename: 'game.js' },
        { team: 'red', language: 'html', filename: 'index.html' },
        { team: 'red', language: 'css', filename: 'game.css' },
        { team: 'red', language: 'js', filename: 'game.js' },
    ],
};
