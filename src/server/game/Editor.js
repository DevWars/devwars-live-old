const { EventEmitter } = require('events');
const throttle = require('lodash/throttle');
const socketValidator = require('../validation/socketValidator');
const EditorDocument = require('./EditorDocument');
const TextOperation = require('../../shared/TextOperation');

class Editor extends EventEmitter {
    constructor(io, editorRef, id, opt) {
        super();
        this.io = io;
        this.ioNsp = this.io.of(`/${id}`);
        this.editorRef = editorRef;

        this.id = id;
        this.document = new EditorDocument();

        this.team = opt.team;
        this.language = opt.language;
        this.filename = opt.filename;

        this.locked = false;

        this.ownerId = null;
        this.currentUser = null;
        this.currentSocketId = null;

        this.saveToFirebase = throttle(this.saveToFirebase, 1000 * 30);

        this.editorRef.child('text').once('value', (snap) => {
            const text = snap.val();
            if (typeof text === 'string') {
                this.document.setText(text);
                this.document.save();

                this.ioNsp.emit('text', this.document.getText());
            }
        });

        editorRef.child('locked').on('value', (snap) => {
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

        socket.on('sel', (payload) => {
            if (socketValidator.validateSel(payload)) {
                this.onSocketSel(socket, payload);
            }
        });
    }

    onSocketDisconnect(socket) {
        if (this.isSocketCurrentUser(socket)) {
            this.resetCurrentUser();
        }
    }

    onSocketInit(socket) {
        socket.emit('state', {
            namespace: this.ioNsp.name,
            team: this.team,
            language: this.team,
            filename: this.team,
            locked: this.locked,
            currentUser: this.currentUser,
            currentSocketId: this.currentSocketId,
            text: this.document.getText(),
        });
    }

    onSocketControl(socket) {
        if (!this.isSocketOwner(socket)) {
            return;
        }

        // Prevent users from taking control from moderators and admins.
        if (
            this.currentUser &&
            !socket.client.user.isModerator() &&
            this.currentUser.isModerator()
        ) {
            return;
        }

        this.setCurrentUser(socket);
    }

    onSocketRelease(socket) {
        if (!this.isSocketCurrentUser(socket)) {
            return;
        }

        this.resetCurrentUser();
    }

    onSocketSave(socket) {
        if (this.locked || !this.isSocketCurrentUser(socket)) {
            return;
        }

        this.document.save();
        this.emit('save');

        this.saveToFirebase();
    }

    onSocketOp(socket, op) {
        if (this.locked || !this.isSocketCurrentUser(socket)) {
            return;
        }

        this.document.applyOperation(TextOperation.fromObject(op));
        this.ioNsp.emit('op', op);
    }

    onSocketSel(socket, sel) {
        if (!this.isSocketCurrentUser(socket)) {
            return;
        }

        this.ioNsp.emit('sel', sel);
    }

    isSocketOwner(socket) {
        const { user } = socket.client;
        if (!user) {
            return false;
        }

        if (user.isModerator()) {
            return true;
        }

        return this.ownerId === user.id;
    }

    isSocketCurrentUser(socket) {
        return this.currentSocketId && this.currentSocketId === socket.id;
    }

    setCurrentUser(socket) {
        const { user } = socket.client;
        if (!user) {
            return;
        }

        this.currentUser = user;
        this.currentSocketId = socket.id;
        this.ioNsp.emit('currentUser', { user, socketId: socket.id });
    }

    resetCurrentUser() {
        this.currentUser = null;
        this.currentSocketId = null;
        this.ioNsp.emit('currentUser', { user: null, socketId: null });
    }

    setOwner(user) {
        this.ownerId = user.id;

        if (this.currentUser) {
            this.resetCurrentUser();
        }
    }

    setLocked(locked) {
        this.editorRef.child('locked').set(locked);
    }

    setText(text) {
        this.document.setText(text);
        this.ioNsp.emit('text', this.document.getText());
    }

    saveToFirebase() {
        const text = this.document.getSavedText();
        this.editorRef.child('text').set(text);
    }

    dispose() {
        for (const key of Object.keys(this.ioNsp.connected)) {
            this.ioNsp.connected[key].disconnect();
        }

        this.ioNsp.removeAllListeners();
        delete this.io.nsps[this.ioNsp.name];

        this.editorRef.child('locked').off();
    }
}

module.exports = Editor;
