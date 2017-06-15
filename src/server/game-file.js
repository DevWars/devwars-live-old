const EventEmitter = require('events').EventEmitter;
const TextOperation = require('../shared/text-operation');

class GameFile extends EventEmitter {
	constructor(io, config) {
		super();
		this.io = io;
		this.buffer = [''];
		this.commitText = '';
		this.language = config.language;

		this.viewers = 0;
		this.user = '';

		this.io.on('connection', this.onConnection.bind(this));
	}

	onConnection(socket) {
		this.viewers += 1;

		socket.on('disconnect', () => {
			this.viewers -= 1
			if (this.user === socket.id) {
				this.user = '';
				this.io.emit('user', this.user);
			}
		});

		socket.on('state', () => {
			socket.emit('state', this.getState());
		});

		socket.on('possess', () => {
			this.user = socket.id;
			this.io.emit('user', this.user);
		});

		socket.on('release', () => {
			if (socket.id === this.user) {
				this.user = '';
			}

			this.io.emit('user', this.user);
		});

		socket.on('commit', () => {
			if (socket.id === this.user) {
				this.commitText = this.getText();
				this.emit('commit');
			}
		});

		socket.on('op', (op) => {
			if (socket.id === this.user) {
				this.applyOperation(TextOperation.fromObject(op));
				socket.broadcast.emit('op', op);
			}
		});
	}

	applyOperation(operation) {
		const { startRow, startCol, endRow, endCol } = operation;
		const lines = operation.text.split('\n');

		lines[0] = this.buffer[startRow].slice(0, startCol) + lines[0];
		lines[lines.length - 1] += this.buffer[endRow].slice(endCol);

		this.buffer.splice(startRow, (endRow - startRow + 1), ...lines);
	}

	getState() {
		const { owner, user } = this;
		const text = this.getText();
		return { owner, user, text };
	}

	getText() {
		return this.buffer.join('\n');
	}

	getCommitText() {
		return this.commitText;
	}
};

module.exports = GameFile;
