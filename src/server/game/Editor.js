const { EventEmitter } = require('events');
const { pick, throttle } = require('lodash');
const socketValidator = require('../validation/socketValidator');
const EditorDocument = require('./EditorDocument');
const TextOperation = require('../../shared/TextOperation');

class Editor extends EventEmitter {
    constructor(io, editorRef, id, opt) {
        super();
        this.io = io;
        this.editorRef = editorRef;

        this.id = id;
        this.document = new EditorDocument();

        this.team = opt.team;
        this.language = opt.language;
        this.filename = opt.filename;

        this.locked = false;
        this.hidden = false;

        this.ownerId = null;
        this.user = null;
        this.userSocketId = null;

        this.document.on('save', throttle(this.saveToFirebase, 1000 * 15).bind(this));

        this.editorRef.child('text').once('value', (snap) => {
            const text = snap.val();
            if (typeof text === 'string') {
                this.document.setText(text);
                this.document.save();

                this.io.emit('e.text', [this.id, this.document.getText()]);
            }
        });

        editorRef.child('locked').on('value', (snap) => {
            this.onFirebaseLocked(snap.val());
        });

        editorRef.child('hidden').on('value', (snap) => {
            this.onFirebaseHidden(snap.val());
        });
    }

    onFirebaseLocked(locked) {
        this.locked = !!locked;
        this.emitState();
    }

    onFirebaseHidden(hidden) {
        this.hidden = !!hidden;
        this.emitState();
    }

    onSocketState(socket) {
        socket.emit('e.state', [
            this.id,
            {
                team: this.team,
                language: this.team,
                filename: this.team,
                user: this.user,
                userSocketId: this.userSocketId,
                text: this.document.getText(),
            },
        ]);
    }

    onSocketControl(socket) {
        if (!this.isSocketOwner(socket)) {
            return;
        }

        // Prevent users from taking control from moderators and admins.
        if (this.user && this.user.isModerator() && !socket.client.user.isModerator()) {
            return;
        }

        this.setUser(socket);
    }

    onSocketRelease(socket) {
        if (this.isSocketCurrentUser(socket)) {
            this.resetUser();
        }
    }

    onSocketSave(socket) {
        if (this.locked || !this.isSocketCurrentUser(socket)) {
            return;
        }

        this.document.save();
        this.emit('save');

        this.saveToFirebase();
    }

    onSocketOperation(socket, operation) {
        if (this.locked || !this.isSocketCurrentUser(socket)) {
            return;
        }

        if (!socketValidator.validateOperation(operation)) {
            return;
        }

        this.document.applyOperation(TextOperation.fromObject(operation));
        this.io.emit('e.o', [this.id, operation]);
    }

    onSocketSelections(socket, selections) {
        if (!this.isSocketCurrentUser(socket)) {
            return;
        }

        if (!socketValidator.validateSelections(selections)) {
            return;
        }

        this.io.emit('e.s', [this.id, selections]);
    }

    isSocketOwner({ client }) {
        if (!client.user) {
            return false;
        }

        return (client.user.isModerator() || client.user.id === this.ownerId);
    }

    isSocketCurrentUser({ id }) {
        return (this.userSocketId && this.userSocketId === id);
    }

    setUser({ id, client }) {
        if (!client.user) {
            return;
        }

        this.user = client.user;
        this.userSocketId = id;

        this.io.emit('e.user', [
            this.id,
            { user: this.user, userSocketId: this.userSocketId },
        ]);
    }

    resetUser() {
        this.user = null;
        this.userSocketId = null;

        this.io.emit('e.user', [this.id, { user: null, socketId: null }]);
    }

    setOwner(user) {
        this.ownerId = user.id;

        if (this.user) {
            this.resetUser();
        }
    }

    setLocked(locked) {
        this.editorRef.child('locked').set(locked);
    }

    setHidden(hidden) {
        this.editorRef.child('hidden').set(hidden);
    }

    setText(text) {
        this.document.setText(text);
        this.document.save();

        this.io.emit('e.text', [this.id, this.document.getText()]);
    }

    saveToFirebase() {
        const text = this.document.getSavedText();
        this.editorRef.child('text').set(text);
    }

    getState() {
        return pick(this, ['id', 'locked', 'hidden']);
    }

    emitState() {
        this.emit('state', this.getState());
    }

    dispose() {
        this.document.dispose();
    }
}

module.exports = Editor;
