const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const Game = require('./game');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const game = new Game(io);

app.use(express.static(path.resolve(__dirname, '../../public')));
app.use('/game', game.routes());

server.listen(8000, () => {
    console.log('Server listening on port 8000');
});
