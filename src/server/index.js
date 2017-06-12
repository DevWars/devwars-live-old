const path = require('path');
const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
const LiveFile = require('./live-file');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.resolve(__dirname, '../../public')));

// HACK: Temporary hack for adding the live files.
[
	{ namespace: '/1', contentType: 'text/html', path: 'index.html' },
	{ namespace: '/2', contentType: 'text/css', path: 'styles.css' },
	{ namespace: '/3', contentType: 'application/javascript', path: 'app.js' },
].forEach((config) => {
	const liveFile = new LiveFile({
		io: io.of(config.namespace),
	});

	app.get(`/live/${config.path}`, (req, res) => {
		res.set('content-type', config.contentType);
		const text = liveFile.getCommitContent();
		res.send(text);
	});
});

server.listen(8000, () => {
	console.log('Server listening on port 8000');
});
