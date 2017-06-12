const TextOperation = require('../shared/text-operation');

class FileBuffer {
	constructor() {
		this.buffer = [''];
		this.commitBuffer = '';
	}

	applyOperation(operation) {
		const { startRow, startCol, endRow, endCol } = operation;
		const lines = operation.text.split('\n');

		lines[0] = this.buffer[startRow].slice(0, startCol) + lines[0];
		lines[lines.length - 1] += this.buffer[endRow].slice(endCol);

		this.buffer.splice(startRow, (endRow - startRow + 1), ...lines);
	}

	setBuffer(content) {
		this.buffer = content ? content.split('\n') : [''];
	}

	commit() {
		this.commitBuffer = this.getLiveContent();
	}

	getLiveContent() {
		return this.buffer.join('\n');
	}

	getCommitContent() {
		return this.commitBuffer;
	}
}

class LiveFile {
	constructor(options) {
		this.io = options.io;
		this.buffer = new FileBuffer();

		this.owner = '';
		this.viewers = 0;

		this.io.on('connection', this.onConnection.bind(this));
	}

	onConnection(socket) {
		this.viewers += 1;
		console.log(`"${socket.id}" connection: viewers(${this.viewers})`);

		socket.on('disconnect', () => {
			this.viewers = this.viewers -= 1;
			if (socket.id === this.owner) {
				this.owner = '';
				this.broadcastMeta();
			}

			console.log(`"${socket.id}" disconnect: viewers(${this.viewers})`);
		});

		socket.on('state', () => {
			console.log(`"${socket.id}" state`);
			socket.emit('state', {
				user: socket.id,
				owner: this.owner,
				text: this.buffer.getLiveContent(),
			});
		});

		socket.on('possess', (user) => {
			console.log(`"${socket.id}" possess:`, user);
			this.owner = user;
			this.broadcastMeta();
		});

		socket.on('release', () => {
			console.log(`"${socket.id}" release`);
			if (socket.id === this.owner) {
				this.owner = '';
			}

			this.broadcastMeta();
		});

		socket.on('op', (op) => {
			console.log(`"${socket.id}" op:`, op);
			if (socket.id === this.owner) {
				this.buffer.applyOperation(TextOperation.fromObject(op));
				socket.broadcast.emit('op', op);
			}
		});

		socket.on('commit', () => {
			console.log(`"${socket.id}" commit`);
			this.buffer.commit();
		});
	}

	broadcastMeta() {
		this.io.emit('meta', {
			owner: this.owner,
		});
	}

	getLiveContent() {
		return this.buffer.getLiveContent();
	}

	getCommitContent() {
		return this.buffer.getCommitContent();
	}
}

module.exports = LiveFile;
