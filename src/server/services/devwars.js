const config = require('config');
const axios = require('axios');

// Trim trailing slash from the API_URL.
const API_URL = config.get('devwars.url').replace(/\/$/, '');
const NODE_ENV = config.util.getEnv('NODE_ENV');

async function authenticate(token) {
    if (NODE_ENV === 'development') {
        switch (token) {
        case 'ADMIN':
        case 'MODERATOR':
        case 'USER':
            return { id: 1, username: token, role: token };
        default:
        }
    }

    try {
        const res = await axios(`${API_URL}/v1/user/`, {
            headers: { cookie: `token=${token}` },
        });

        if (res.status !== 200) {
            return null;
        }

        return res.data;
    } catch (error) {
        return null;
    }
}

module.exports = {
    authenticate,
};
