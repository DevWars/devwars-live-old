const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const game = require('./game');
const gameRoutes = require('./routes/game-routes');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

game.init(io, { files: [
	{ namespace: '/1', team: 'red', language: 'html', filename: 'index.html' },
	{ namespace: '/2', team: 'red', language: 'css', filename: 'styles.css' },
	{ namespace: '/3', team: 'red', language: 'javascript', filename: 'script.js' },
]});

app.use(express.static(path.resolve(__dirname, '../../public')));
app.use('/game', gameRoutes);

server.listen(8000, () => {
	console.log('Server listening on port 8000');
});
