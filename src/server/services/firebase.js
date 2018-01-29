const config = require('config');
const firebaseAdmin = require('firebase-admin');

const serviceAccount = config.get('firebase.serviceAccount');
const databaseURL = config.get('firebase.databaseURL');

module.exports = firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
    databaseURL,
});
