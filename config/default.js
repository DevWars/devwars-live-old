require('dotenv').config();

const PORT = process.env.PORT || 8000;
const DEVWARS_URL = process.env.DEVWARS_URL;
const FIREBASE_DATABASE_URL = process.env.FIREBASE_DATABASE_URL;

module.exports = {
    port: PORT,

    devwars: {
        url: DEVWARS_URL,
    },

    firebase: {
        serviceAccount: require('./serviceAccountKey.json'),
        databaseURL: FIREBASE_DATABASE_URL,
    },

    editors: [
        { team: 'blue', language: 'html', filename: 'index.html' },
        { team: 'blue', language: 'css', filename: 'game.css' },
        { team: 'blue', language: 'javascript', filename: 'game.js' },
        { team: 'red', language: 'html', filename: 'index.html' },
        { team: 'red', language: 'css', filename: 'game.css' },
        { team: 'red', language: 'javascript', filename: 'game.js' },
    ],
};
