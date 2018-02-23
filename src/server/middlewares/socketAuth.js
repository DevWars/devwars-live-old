const cookie = require('cookie');
const User = require('../models/User');
const devwars = require('../services/devwars');

function socketAuth() {
    return async (socket, next) => {
        const { headers } = socket.handshake;

        const token = cookie.parse(headers.cookie || '').token;
        if (!token) {
            return next();
        }

        const user = await devwars.authenticate(token);
        if (!user) {
            return next();
        }

        socket.client.user = new User(user);
        socket.emit('user', socket.client.user);
        next();
    }
}

module.exports = socketAuth;
