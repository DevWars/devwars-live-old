const config = require('config');
const { Router } = require('express');
const devwars = require('../services/devwars');
const firebase = require('../services/firebase');
const socketValidator = require('../validation/socketValidator');
const Editor = require('./Editor');

const _ = require('lodash');

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

        // the templates being used on the current game per language per user
        // and per team. These should be set during the start of the game but
        // not after the game has already begun.
        this.templates = { html: '', css: '', js: '' };

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
        this._initFirebaseListeners();

        this.io.on('connection', this.onSocketConnection.bind(this));
    }

    _initEditors() {
        this.editors = config.get('editors').map((opt, index) => {
            const editorRef = this.gameRef.child(`editors/${index}`);
            return new Editor(this.io, editorRef, index, opt);
        });

        for (const editor of this.editors) {
            editor.on('save', () => this.io.emit('reloadSite', editor.team));
        }

        this.assignPlayersToEditors();
        this.io.emit(
            'editors',
            this.editors.map((e) => e.getState()),
        );
    }

    _initRoutes() {
        this.router = new Router();

        this.router.get('/:team(blue|red)', (req, res) => {
            debugger;
            res.redirect(`/game/${req.params.team}/index.html`);
        });

        this.router.get('/:team(blue|red)/:filename', (req, res) => {
            const { team, filename } = req.params;
            const editor = this.editors.find((editor) => {
                return editor.team === team && editor.filename === filename;
            });

            if (!editor) {
                return res.sendStatus(404);
            }

            res.type(editor.language);
            res.send(editor.document.getSavedText());
        });
    }

    _initFirebaseListeners() {
        // Live game state
        this.gameRef.child('state').on('value', (snap) => {
            this.onFirebaseState(snap.val());
        });

        this.gameRef.child('objectives').on('value', (snap) => {
            this.onFirebaseObjectives(snap.val());
        });

        this.gameRef.child('players').on('value', (snap) => {
            this.onFirebasePlayers(snap.val());
        });

        // Game state
        this.database.ref('game/name').on('value', (snap) => {
            this.onFirebaseGameName(snap.val());
        });

        this.database.ref('game/teams').on('value', (snap) => {
            this.onFirebaseGameTeams(snap.val());
        });

        this.database.ref('game/objectives').on('value', (snap) => {
            this.onFirebaseGameObjectives(snap.val());
        });

        /**
         * When the templates are updated for the given game, ensure to update
         * any clients and the server with the new game templates. These will be
         * used for the preparing of the current game state.
         */
        this.database.ref('/game/templates').on('value', (snap) => {
            this.onFirebaseGameTemplates(snap.val());
        });

        // Frame state
        this.database.ref('frame/liveVoting').on('value', (snap) => {
            this.onFirebaseFrameVotes(snap.val());
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
        if (_.isNil(name) || !_.isString(name)) return;
        this.gameRef
            .child('state/gameMode')
            .set(name.split(' ')[0].toLowerCase());
    }

    /**
     * The templates that are going to be used on the following game.
     * @param {object} templates The object containing our games templates.
     */
    onFirebaseGameTemplates(templates) {
        console.log(templates);
        if (_.isNil(templates) || !_.isObject(templates)) return;
        console.log(templates);

        this.templates = templates;
        this.io.emit('templates', this.templates);

        this.generateGameTemplatesForTeams();
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
            .map((gameObjective) => ({
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
        socket.on('disconnect', () => {
            this.editors
                .filter((e) => e.userSocketId === socket.id)
                .forEach((e) => e.resetUser());
        });

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

        socket.on('set-end-time', (payload) => {
            this.onSocketSetEndTime(socket, payload);
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

        socket.on('e.state', (id) => {
            const editor = this.editors.find((e) => e.id === id);
            if (editor) editor.onSocketState(socket);
        });

        socket.on('e.control', (id) => {
            const editor = this.editors.find((e) => e.id === id);
            if (editor) editor.onSocketControl(socket);
        });

        socket.on('e.release', (id) => {
            const editor = this.editors.find((e) => e.id === id);
            if (editor) editor.onSocketRelease(socket);
        });

        socket.on('e.save', (id) => {
            const editor = this.editors.find((e) => e.id === id);
            if (editor) editor.onSocketSave(socket);
        });

        socket.on('e.o', ([id, operation]) => {
            const editor = this.editors.find((e) => e.id === id);
            if (editor && operation)
                editor.onSocketOperation(socket, operation);
        });

        socket.on('e.s', ([id, selections]) => {
            const editor = this.editors.find((e) => e.id === id);
            if (editor && selections)
                editor.onSocketSelections(socket, selections);
        });
    }

    onSocketInit(socket) {
        socket.emit('state', this.state);
        socket.emit('objectives', this.objectives);
        socket.emit('players', this.players);
        socket.emit(
            'editors',
            this.editors.map((e) => e.getState()),
        );
        socket.emit('templates', this.templates);
        socket.emit('votes', this.votes);
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
        if (
            !socket.client.user ||
            !this.isUserOnTeam(socket.client.user, team)
        ) {
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

        this.gameRef.child('objectives').transaction((objectives) => {
            if (objectives) {
                for (const objective of Object.values(objectives)) {
                    objective.blueState = 'incomplete';
                    objective.redState = 'incomplete';
                }
            }

            return objectives;
        });

        this.editors.forEach((editor) => {
            editor.resetUser();
            editor.setLocked(true);
            editor.setText('');
        });
    }

    onSocketStartGame(socket) {
        if (!socket.client.user || !socket.client.user.isModerator()) {
            return;
        }

        const startTime = Date.now();
        this.gameRef.child('state').update({
            stage: 'running',
            startTime,
            endTime: startTime + 1000 * 60 * 60,
        });

        this.editors.forEach((editor) => editor.setLocked(false));
    }

    onSocketEndGame(socket) {
        if (!socket.client.user || !socket.client.user.isModerator()) {
            return;
        }

        this.gameRef.child('state').update({
            stage: 'ended',
            endTime: Date.now(),
        });

        this.editors.forEach((editor) => editor.setLocked(true));
    }

    onSocketSetEndTime(socket, endTime) {
        if (!socket.client.user || !socket.client.user.isModerator()) {
            return;
        }

        this.gameRef.child('state').update({ endTime });
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

    /**
     * If the game has not yet started, update all the editors with all the
     * related templates that are currently set.
     */
    generateGameTemplatesForTeams() {
        this.editors[0].setText(this.templates.html || '');
        this.editors[1].setText(this.templates.css || '');
        this.editors[2].setText(this.templates.js || '');

        this.editors[3].setText(this.templates.html || '');
        this.editors[4].setText(this.templates.css || '');
        this.editors[5].setText(this.templates.js || '');
    }

    isUserOnTeam(user, team) {
        return this.players.some((player) => {
            return player.id === user.id && player.team === team;
        });
    }
}

module.exports = Game;
