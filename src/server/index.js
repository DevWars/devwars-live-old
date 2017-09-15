const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const Game = require('./game');

const PORT = process.env['PORT'] || 8000;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const game = new Game(io);

app.use(express.static(path.resolve(__dirname, '../../public')));
app.use('/game', game.routes());

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../public/index.html'))
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
