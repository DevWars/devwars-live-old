const { EventEmitter } = require('events');
const throttle = require('lodash/throttle');
const firebase = require('../services/firebase');
const socketValidator = require('../validation/socketValidator');
const EditorDocument = require('./EditorDocument');
const TextOperation = require('../../shared/TextOperation');

class Editor extends EventEmitter {
    constructor(io, id, opt) {
        super();
        this.io = io;
        this.ioNsp = this.io.of(`/${id}`);

        this.id = id;
        this.document = new EditorDocument();

        this.team = opt.team;
        this.language = opt.language;
        this.filename = opt.filename;

        this.ownerId = null;
        this.curUser = null;
        this.locked = false;

        this.saveToFirebase = throttle(this.saveToFirebase, 1000 * 60);

        firebase.database().ref(`liveGame/editors/${id}/text`).once('value', (snap) => {
            const text = snap.val();
            if (typeof text === 'string') {
                this.document.setText(text);
                this.document.save();

                this.ioNsp.emit('text', this.document.getText());
            }
        });

        firebase.database().ref(`liveGame/editors/${id}/locked`).on('value', (snap) => {
            this.onFirebaseLocked(snap.val());
        });

        this.ioNsp.on('connection', this.onSocketConnection.bind(this));
    }

    onFirebaseLocked(locked) {
        this.locked = locked;
        this.ioNsp.emit('locked', locked);
    }

    onSocketConnection(socket) {
        socket.on('disconnect', () => {
            this.onSocketDisconnect(socket);
        });

        socket.on('init', () => {
            this.onSocketInit(socket);
        });

        socket.on('control', () => {
            this.onSocketControl(socket);
        });

        socket.on('release', () => {
            this.onSocketRelease(socket);
        });

        socket.on('save', () => {
            this.onSocketSave(socket);
        });

        socket.on('op', (payload) => {
            if (socketValidator.validateOp(payload)) {
                this.onSocketOp(socket, payload);
            }
        });
    }

    onSocketDisconnect(socket) {
        if (this.userIsCurUser(socket)) {
            this.curUser = null;
            this.ioNsp.emit('curUser', this.curUser);
        }
    }

    onSocketInit(socket) {
        socket.emit('state', {
            namespace: this.ioNsp.name,
            team: this.team,
            language: this.team,
            filename: this.team,
            locked: this.locked,

            curUser: this.curUser,
            text: this.document.getText(),
        });
    }

    onSocketControl(socket) {
        if (this.userIsOwner(socket)) {
            // Prevent users from taking control from moderators and admins.
            if (
                this.curUser &&
                socket.client.user.role === 'USER' &&
                (this.curUser.role === 'MODERATOR' || this.curUser.role === 'ADMIN')
            ) {
                return;
            }

            this.curUser = {
                ...socket.client.user,
                socketId: socket.id,
            };

            this.ioNsp.emit('cur-user', this.curUser);
        }
    }

    onSocketRelease(socket) {
        if (this.userIsCurUser(socket)) {
            this.curUser = null;
            this.ioNsp.emit('cur-user', this.curUser);
        }
    }

    onSocketSave(socket) {
        if (this.userIsCurUser(socket)) {
            this.document.save();
            this.emit('save');

            this.saveToFirebase();
        }
    }

    onSocketOp(socket, op) {
        if (!this.locked && this.userIsCurUser(socket)) {
            this.document.applyOperation(TextOperation.fromObject(op));
            this.ioNsp.emit('op', op);
        }
    }

    userIsOwner(socket) {
        const { user } = socket.client;
        if (user) {
            if (
                user.role === 'ADMIN' ||
                user.role === 'MODERATOR' ||
                user.id === this.ownerId
            ) {
                return true;
            }
        }

        return false;
    }

    userIsCurUser(socket) {
        if (this.curUser && this.curUser.socketId === socket.id) {
            return true;
        }

        return false;
    }

    setOwner(user) {
        this.ownerId = user.id;
        if (this.curUser) {
            this.curUser = null;
            this.ioNsp.emit('cur-user', null);
        }
    }

    setLocked(locked) {
        firebase.database().ref(`liveGame/editors/${this.id}/locked`).set(locked);
    }

    saveToFirebase() {
        const text = this.document.getSavedText();
        firebase.database().ref(`liveGame/editors/${this.id}/text`).set(text);
    }

    dispose() {
        for (const key of Object.keys(this.ioNsp.connected)) {
            this.ioNsp.connected[key].disconnect();
        }

        this.ioNsp.removeAllListeners();
        delete this.io.nsps[this.ioNsp.name];
    }
}

module.exports = Editor;
