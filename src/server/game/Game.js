const config = require('config');
const { Router } = require('express');
const devwars = require('../services/devwars');
const firebase = require('../services/firebase');
const socketValidator = require('../validation/socketValidator');
const Editor = require('./Editor');

class Game {
    constructor(io) {
        this.io = io;
        this.firebase = firebase;

        this.state = {
            id: 0,
            stage: 'setup',
            startTime: 0,
            endTime: 0,
            blueStrikes: 0,
            redStrikes: 0,
        };

        this.votes = {
            blueDesign: 0,
            redDesign: 0,
            blueFunc: 0,
            redFunc: 0,
            blueTiebreaker: 0,
            redTiebreaker: 0,
        };

        this.players = [];
        this.objectives = [];

        this._initEditors();
        this._initRoutes();

        this.firebase.database().ref('liveGame/state').on('value', (snap) => {
            this.onFirebaseState(snap.val());
        });

        this.firebase.database().ref('liveGame/objectives').on('value', (snap) => {
            this.onFirebaseObjectives(snap.val());
        });

        this.firebase.database().ref('liveGame/players').on('value', (snap) => {
            this.onFirebasePlayers(snap.val());
        });

        this.firebase.database().ref('game/teams').on('value', (snap) => {
            this.onFirebaseGameTeams(snap.val());
        });

        this.firebase.database().ref('game/objectives').on('value', (snap) => {
            this.onFirebaseGameObjectives(snap.val());
        });

        this.firebase.database().ref('frame/liveVoting').on('value', (snap) => {
            this.onFirebaseFrameVotes(snap.val());
        });

        this.io.on('connection', this.onSocketConnection.bind(this));
    }

    _initEditors() {
        this.editors = config.get('editors').map((opt, index) => {
            return new Editor(this.io, index, opt);
        });

        this.editors.forEach((editor) => {
            editor.on('save', () => {
                this.io.emit('reload-site', editor.team);
            });
        });

        this.assignPlayersToEditors();
    }

    _initRoutes() {
        this.router = new Router();

        this.router.get('/:team(blue|red)', (req, res) => {
            res.redirect(`${req.params.team}/index.html`);
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
        this.objectives = objectives;
        this.io.emit('objectives', this.objectives);
    }

    onFirebasePlayers(players) {
        this.players = players;
        this.io.emit('players', this.players);

        this.assignPlayersToEditors();
    }

    onFirebaseGameTeams(gameTeams) {
        const players = [];
        for (const team of ['blue', 'red']) {
            for (const gamePlayer of gameTeams[team].players) {
                let editorId = team === 'blue' ? 0 : 3;
                const language = gamePlayer.language.toLowerCase();
                if (language === 'css') {
                    editorId += 1;
                } else if (language === 'js') {
                    editorId += 2;
                }

                const { id, username } = gamePlayer.user;
                players.push({ editorId, id, username });
            }
        }

        this.firebase.database().ref('liveGame/players').set(players);
    }

    onFirebaseGameObjectives(gameObjectives) {
        const objectives = gameObjectives
            .sort((a, b) => a.orderID - b.orderID)
            .map((gameObjective) => {
                return {
                    isBonus: false,
                    description: gameObjective.objectiveText,
                    blueState: 'incomplete',
                    redState: 'incomplete',
                }
            });

        objectives[objectives.length - 1].isBonus = true;
        this.firebase.database().ref('liveGame/objectives').set(objectives);
    }

    onFirebaseFrameVotes(votes) {
        this.votes = {
            blueDesign: votes.design.blue,
            redDesign: votes.design.red,
            blueFunc: votes.func.blue,
            redFunc: votes.func.red,
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
    }

    onSocketInit(socket) {
        socket.emit('state', this.state);
        socket.emit('objectives', this.objectives);
        socket.emit('players', this.players);
        socket.emit('votes', this.votes);
    }

    async onSocketAuth(socket, token, callback) {
        const user = await devwars.authenticate(token);
        if (!user) {
            return callback(null);
        }

        socket.client.user = user;
        callback(user);
    }

    onSocketObjectiveNotify(socket, { team, id }) {
        if (!this.isUserOnTeam(socket, team)) {
            return;
        }

        const objective = this.objectives[id];
        if (!objective) {
            return;
        }

        this.firebase.database().ref(`liveGame/objectives/${id}`).transaction((objective) => {
            if (!objective) {
                return;
            }

            const key = `${team}State`;
            if (objective[key] === 'incomplete') {
                objective[key] = 'pending';
            }

            return objective;
        });
    }

    onSocketResetGame(socket) {
        if (!this.isUserModerator(socket)) {
            return;
        }

        this.firebase.database().ref('liveGame/state').update({
            stage: 'setup',
            startTime: 0,
            endTime: 0,

            blueStrikes: 0,
            redStrikes: 0,
        });

        this.editors.forEach(editor => editor.setLocked(true));
    }

    onSocketStartGame(socket) {
        if (!this.isUserModerator(socket)) {
            return;
        }

        const startTime = Date.now();
        this.firebase.database().ref('liveGame/state').update({
            stage: 'running',
            startTime,
            endTime: startTime + (1000 * 60 * 60),
        });

        this.editors.forEach(editor => editor.setLocked(false));
    }

    onSocketEndGame(socket) {
        if (!this.isUserModerator(socket)) {
            return;
        }

        this.firebase.database().ref('liveGame/state').update({
            stage: 'ended',
            endTime: Date.now(),
        });

        this.editors.forEach(editor => editor.setLocked(true));
    }

    onSocketSetObjectiveState(socket, { team, id, state }) {
        if (!this.isUserModerator(socket)) {
            return;
        }

        const objective = this.objectives[id];
        if (!objective) {
            return;
        }

        this.firebase.database().ref(`liveGame/objectives/${id}`).transaction((objective) => {
            if (!objective) {
                return;
            }

            objective[`${team}State`] = state;
            return objective;
        });
    }

    onSocketAddStrike(socket, team) {
        if (!this.isUserModerator(socket)) {
            return;
        }

        this.firebase.database().ref(`liveGame/state/${team}Strikes`).transaction((strikes) => {
            if (strikes === null) {
                return;
            }

            return strikes < 3 ? strikes + 1 : 0;
        });
    }

    assignPlayersToEditors() {
        for (const player of this.players) {
            const editor = this.editors[player.editorId];
            if (editor && editor.ownerId !== player.id) {
                editor.setOwner(player);
            }
        }
    }

    isUserModerator(socket) {
        const { user } = socket.client;
        if (!user) {
            return false;
        }

        return (user.role === 'ADMIN' || user.role === 'MODERATOR');
    }

    isUserOnTeam(socket, team) {
        const { user } = socket.client;
        if (!user) {
            return false;
        }

        return this.players.some((player) => {
            return (player.id === user.id && player.team === team);
        });
    }
}

module.exports = Game;
