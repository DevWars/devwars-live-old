const config = require('config');
const { Router } = require('express');
const devwars = require('../services/devwars');
const firebase = require('../services/firebase');
const socketValidator = require('../validation/socketValidator');
const Editor = require('./Editor');

class Game {
    constructor(io) {
        this.io = io;
        this.database = firebase.database();
        this.gameRef = this.database.ref('liveGame');

        this.state = {
            id: 0,
            gameMode: 'classic',
            stage: 'setup',
            startTime: 0,
            endTime: 0,
            blueStrikes: 0,
            redStrikes: 0,
        };

        this.zenTemplate = '';

        this.votes = {
            blueUi: 0,
            redUi: 0,
            blueUx: 0,
            redUx: 0,
            blueTiebreaker: 0,
            redTiebreaker: 0,
        };

        this.players = [];
        this.objectives = [];

        this._initEditors();
        this._initRoutes();

        this.gameRef.child('state').on('value', (snap) => {
            this.onFirebaseState(snap.val());
        });

        this.gameRef.child('objectives').on('value', (snap) => {
            this.onFirebaseObjectives(snap.val());
        });

        this.gameRef.child('players').on('value', (snap) => {
            this.onFirebasePlayers(snap.val());
        });

        this.database.ref('game/name').on('value', (snap) => {
            this.onFirebaseGameName(snap.val());
        });

        this.database.ref('game/teams').on('value', (snap) => {
            this.onFirebaseGameTeams(snap.val());
        });

        this.database.ref('game/objectives').on('value', (snap) => {
            this.onFirebaseGameObjectives(snap.val());
        });

        this.database.ref('game/template/html').on('value', (snap) => {
            this.onFirebaseZenTemplate(snap.val());
        });

        this.database.ref('frame/liveVoting').on('value', (snap) => {
            this.onFirebaseFrameVotes(snap.val());
        });

        this.io.on('connection', this.onSocketConnection.bind(this));
    }

    _initEditors() {
        this.editors = config.get('editors').map((opt, index) => {
            const editorRef = this.gameRef.child(`editors/${index}`);
            return new Editor(this.io, editorRef, index, opt);
        });

        for (const editor of this.editors) {
            editor.on('state', state => this.io.emit('editorState', state));
            editor.on('save', () => this.io.emit('reloadSite', editor.team));
        }

        this.assignPlayersToEditors();
    }

    _initRoutes() {
        this.router = new Router();

        this.router.get('/:team(blue|red)', (req, res) => {
            res.redirect(`/game/${req.params.team}/index.html`);
        });

        this.router.get('/:team(blue|red)/:filename', (req, res) => {
            const { team, filename } = req.params;
            const editor = this.editors.find((editor) => {
                return (editor.team === team && editor.filename === filename);
            });

            if (!editor) {
                return res.sendStatus(404);
            }

            res.type(editor.language);
            res.send(editor.document.getSavedText());
        });
    }

    onFirebaseState(state) {
        this.state = state;
        this.io.emit('state', this.state);
    }

    onFirebaseObjectives(objectives) {
        this.objectives = objectives || [];
        this.io.emit('objectives', this.objectives);
    }

    onFirebasePlayers(players) {
        this.players = players || [];
        this.io.emit('players', this.players);

        this.assignPlayersToEditors();
    }

    onFirebaseGameName(name) {
        const gameMode = name.includes('zen') ? 'zen' : 'classic';
        this.gameRef.child('state/gameMode').set(gameMode);

        if (gameMode === 'zen') {
            this.generateZenDocuments();
        }
    }

    onFirebaseZenTemplate(zenTemplate) {
        this.zenTemplate = zenTemplate;
        this.io.emit('zenTemplate', zenTemplate);
        this.generateZenDocuments();
    }

    onFirebaseGameTeams(gameTeams) {
        if (!gameTeams) {
            return this.gameRef.child('players').set(null);
        }

        const players = [];
        for (const team of ['blue', 'red']) {
            if (!gameTeams[team] || !gameTeams[team].players) {
                continue;
            }

            for (const gamePlayer of gameTeams[team].players) {
                let editorId = team === 'blue' ? 0 : 3;
                const language = gamePlayer.language.toLowerCase();
                if (language === 'css') {
                    editorId += 1;
                } else if (language === 'js') {
                    editorId += 2;
                }

                const { id, username } = gamePlayer.user;
                players.push({ editorId, id, username, team });
            }
        }

        this.gameRef.child('players').set(players);
    }

    onFirebaseGameObjectives(gameObjectives) {
        if (!gameObjectives) {
            return this.gameRef.child('objectives').set(null);
        }

        const objectives = gameObjectives
            .sort((a, b) => a.number - b.number)
            .map(gameObjective => ({
                isBonus: false,
                description: gameObjective.description,
                blueState: 'incomplete',
                redState: 'incomplete',
            }));

        // The last objective is always the bonus objective.
        objectives[objectives.length - 1].isBonus = true;

        this.gameRef.child('objectives').set(objectives);
    }

    onFirebaseFrameVotes(votes) {
        this.votes = {
            blueUi: votes.ui.blue,
            redUi: votes.ui.red,
            blueUx: votes.ux.blue,
            redUx: votes.ux.red,
            blueTiebreaker: votes.tiebreaker.blue,
            redTiebreaker: votes.tiebreaker.red,
        };

        this.io.emit('votes', this.votes);
    }

    onSocketConnection(socket) {
        socket.on('init', () => {
            this.onSocketInit(socket);
        });

        socket.on('auth', (payload, callback) => {
            if (socketValidator.validateAuth(payload)) {
                this.onSocketAuth(socket, payload, callback);
            }
        });

        socket.on('objective-notify', (payload) => {
            if (socketValidator.validateObjectiveNotify(payload)) {
                this.onSocketObjectiveNotify(socket, payload);
            }
        });

        socket.on('reset-game', () => {
            this.onSocketResetGame(socket);
        });

        socket.on('start-game', () => {
            this.onSocketStartGame(socket);
        });

        socket.on('end-game', () => {
            this.onSocketEndGame(socket);
        });

        socket.on('set-objective-state', (payload) => {
            if (socketValidator.validateSetObjectiveState(payload)) {
                this.onSocketSetObjectiveState(socket, payload);
            }
        });

        socket.on('add-strike', (payload) => {
            if (socketValidator.validateAddStrike(payload)) {
                this.onSocketAddStrike(socket, payload);
            }
        });

        socket.on('toggle-editor-locked', (payload) => {
            if (socketValidator.validateToggleEditorLocked(payload)) {
                this.onSocketToggleEditorLocked(socket, payload);
            }
        });

        socket.on('toggle-editor-hidden', (payload) => {
            if (socketValidator.validateToggleEditorHidden(payload)) {
                this.onSocketToggleEditorHidden(socket, payload);
            }
        });
    }

    onSocketInit(socket) {
        socket.emit('state', this.state);
        socket.emit('objectives', this.objectives);
        socket.emit('players', this.players);
        socket.emit('zenTemplate', this.zenTemplate);
        socket.emit('votes', this.votes);
        this.editors.forEach(e => socket.emit('editorState', e.getState()));
    }

    static onSocketAuth(socket, token, callback) {
        devwars.authenticate(token).then((user) => {
            if (user) {
                socket.client.user = user;
                callback(user);
            }

            callback(null);
        });
    }

    onSocketObjectiveNotify(socket, { team, id }) {
        if (!socket.client.user || !this.isUserOnTeam(socket.client.user, team)) {
            return;
        }

        const objective = this.objectives[id];
        if (!objective) {
            return;
        }

        this.gameRef.child(`objectives/${id}`).transaction((objective) => {
            if (objective) {
                const key = `${team}State`;
                if (objective[key] === 'incomplete') {
                    objective[key] = 'pending';
                }
            }

            return objective;
        });
    }

    onSocketResetGame(socket) {
        if (!socket.client.user || !socket.client.user.isModerator()) {
            return;
        }

        this.gameRef.child('state').update({
            stage: 'setup',
            startTime: 0,
            endTime: 0,

            blueStrikes: 0,
            redStrikes: 0,
        });

        this.editors.forEach(editor => editor.setLocked(true));
    }

    onSocketStartGame(socket) {
        if (!socket.client.user || !socket.client.user.isModerator()) {
            return;
        }

        const startTime = Date.now();
        this.gameRef.child('state').update({
            stage: 'running',
            startTime,
            endTime: startTime + (1000 * 60 * 60),
        });

        this.editors.forEach(editor => editor.setLocked(false));
    }

    onSocketEndGame(socket) {
        if (!socket.client.user || !socket.client.user.isModerator()) {
            return;
        }

        this.gameRef.child('state').update({
            stage: 'ended',
            endTime: Date.now(),
        });

        this.editors.forEach(editor => editor.setLocked(true));
    }

    onSocketSetObjectiveState(socket, { team, id, state }) {
        if (!socket.client.user || !socket.client.user.isModerator()) {
            return;
        }

        const objective = this.objectives[id];
        if (!objective) {
            return;
        }

        this.gameRef.child(`objectives/${id}`).transaction((objective) => {
            if (objective) {
                objective[`${team}State`] = state;
            }

            return objective;
        });
    }

    onSocketAddStrike(socket, team) {
        if (!socket.client.user || !socket.client.user.isModerator()) {
            return;
        }

        this.gameRef.child(`state/${team}Strikes`).transaction((strikes) => {
            if (typeof strikes === 'number') {
                strikes = strikes < 3 ? strikes + 1 : 0;
            }

            return strikes;
        });
    }

    onSocketToggleEditorLocked(socket, { id, locked }) {
        if (!socket.client.user || !socket.client.user.isModerator()) {
            return;
        }

        this.gameRef.child(`editors/${id}/locked`).set(locked);
    }

    onSocketToggleEditorHidden(socket, { id, hidden }) {
        if (!socket.client.user || !socket.client.user.isModerator()) {
            return;
        }

        this.gameRef.child(`editors/${id}/hidden`).set(hidden);
    }

    assignPlayersToEditors() {
        for (const player of this.players || []) {
            const editor = this.editors[player.editorId];
            if (editor && editor.ownerId !== player.id) {
                editor.setOwner(player);
            }
        }
    }

    generateZenDocuments() {
        if (this.state.gameMode !== 'zen') {
            return;
        }

        this.editors[0].setText(this.zenTemplate);
        this.editors[3].setText(this.zenTemplate);
    }

    isUserOnTeam(user, team) {
        return this.players.some((player) => {
            return (player.id === user.id && player.team === team);
        });
    }
}

module.exports = Game;
