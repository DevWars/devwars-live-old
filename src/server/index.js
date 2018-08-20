const config = require('config');
const path = require('path');
const http = require('http');
const express = require('express');
const helmet = require('helmet');
const socketIo = require('socket.io');
const Game = require('./game/Game');
const routes = require('./routes');
const socketAuth = require('./middleware/socketAuth');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { transports: ['websocket'] });
io.use(socketAuth());

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
app.use(helmet({ frameguard: false }));
app.use(express.static(path.resolve(__dirname, '../../public')));

const game = new Game(io);

app.use(routes);
app.use('/game', game.router);
app.use('*', (req, res) => res.sendStatus(404));

app.use((err, req, res) => {
    if (config.util.getEnv('NODE_ENV') === 'development') {
        res.status(500).send(err.message);
    } else {
        res.sendStatus(500);
    }
});

const port = config.get('port');
server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
