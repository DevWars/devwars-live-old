const { Router } = require('express');
const GameFile = require('./game-file');

const FILES_CONFIG = [
    { namespace: '/1', team: 'red', language: 'html', filename: 'index.html' },
    { namespace: '/2', team: 'red', language: 'css', filename: 'game.css' },
    { namespace: '/3', team: 'red', language: 'js', filename: 'game.js' },
    { namespace: '/4', team: 'blue', language: 'html', filename: 'index.html' },
    { namespace: '/5', team: 'blue', language: 'css', filename: 'game.css' },
    { namespace: '/6', team: 'blue', language: 'js', filename: 'game.js' },
];

// TODO: Remove.
const OBJECTIVES = [
    { description: 'Objective A', isBonus: false, red: 0, blue: 0 },
    { description: 'Objective B', isBonus: false, red: 0, blue: 0 },
    { description: 'Objective C', isBonus: true, red: 0, blue: 0 },
];

class Game {
    constructor(io) {
        this.io = io;
        this.viewers = 0;
        this.stage = 'pre-start';
        this.endDate = null;
        this.objectives = OBJECTIVES;
        this.gameFiles = this._initFiles(FILES_CONFIG);

        this.router = this._initRouter();

        this.onConnection = this.onConnection.bind(this);
        this.io.on('connection', this.onConnection);
    }

    _initRouter() {
        const router = new Router();

        router.get('/:team(red|blue)', (req, res) => {
            res.redirect(`${req.params.team}/index.html`);
        });

        router.get('/:team(red|blue)/:filename', (req, res) => {
            const { team, filename } = req.params;
            const gameFile = this.gameFiles.get(`${team}/${filename}`);
            if (!gameFile) {
                return res.sendStatus(404);
            }

            res.type(gameFile.language);
            res.send(gameFile.getSavedContent());
        });

        return router;
    }

    _initFiles(files) {
        const gameFiles = new Map();
        for (const file of files) {
            const gameFile = new GameFile(this.io.of(file.namespace), file);
            gameFiles.set(`${file.team}/${file.filename}`, gameFile);

            gameFile.on('save', () => {
                this.io.emit('reload', file.team);
            });
        }

        return gameFiles;
    }

    onConnection(socket) {
        this.viewers += 1;

        socket.on('disconnect', () => {
            this.viewers -= 1;
        });

        socket.on('state', () => {
            socket.emit('state', this.getStateObject());
        });

        socket.on('cycle-objective-score', ({ index, team }) => {
            const objective = this.objectives[index];
            const score = objective[team]
            if (objective && score !== undefined && Number.isInteger(score)) {
                objective[team] = score < 2 ? score + 1 : 0;
                this.io.emit('state', this.getStateObject());
            }
        });
    }

    getStateObject() {
        const { viewers, stage, endDate, objectives } = this;
        return { viewers, stage, endDate, objectives };
    }

    routes() {
        return this.router;
    }
}

module.exports = Game;
