const path = require('path');
const http = require('http');
const express = require('express');
const ioSocket = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = ioSocket(server);

app.use(express.static(path.resolve(__dirname, '../../public')));

server.listen(8000, () => {
	console.log('Server listening on port 8000');
});
