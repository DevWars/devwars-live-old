const { EventEmitter } = require('events');
const TextOperation = require('../shared/text-operation');

class GameFile extends EventEmitter {
    constructor(nsp, options) {
        super();
        this.nsp = nsp;
        this.buffer = [''];
        this.saved = '';

        this.owner = null;
        this.activeUser = null;
        this.language = options.language;

        this.onConnection = this.onConnection.bind(this);
        this.nsp.on('connection', this.onConnection);
    }

    onConnection(socket) {
        socket.on('disconnect', () => {
            if (this.activeUser === socket.id) {
                this.activeUser = '';
                this.nsp.emit('user', this.user);
            }
        });

        socket.on('state', () => {
            socket.emit('state', this.getStateObject());
        });

        socket.on('possess', () => {
            this.activeUser = socket.id;
            this.nsp.emit('user', this.activeUser);
        });

        socket.on('release', () => {
            if (socket.id === this.activeUser) {
                this.activeUser = '';
            }

            this.nsp.emit('user', this.user);
        });

        socket.on('save', () => {
            if (socket.id === this.activeUser) {
                this.saved = this.getContent();
                this.emit('save');
            }
        });

        socket.on('op', (op) => {
            if (socket.id === this.activeUser) {
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

    getStateObject() {
        return {
            activeUser: this.activeUser,
            language: this.language,
            content: this.getContent(),
        };
    }

    getContent() {
        return this.buffer.join('\n');
    }

    getSavedContent() {
        return this.saved;
    }
}

module.exports = GameFile;
