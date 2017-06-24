const GameFile = require('./game-file');

let io = null;
let viewers = 0;
const files = new Map();
const objectives = [
    { title: 'Objective A', isBonus: false, redStatus: 0, blueStatus: 0 },
    { title: 'Objective B', isBonus: false, redStatus: 0, blueStatus: 0 },
    { title: 'Objective C', isBonus: true, redStatus: 0, blueStatus: 0 },
];

function onConnection(socket) {
    viewers += 1;

    socket.on('disconnect', () => {
        viewers -= 1;
    });

    socket.on('state', () => {
        socket.emit('state', { objectives });
    });

    socket.on('cycle-objective-status', ({ index, team }) => {
        const objective = objectives[index];
        const key = `${team}Status`;
        if (objective && objective[key] !== undefined) {
            objective[key] = objective[key] < 3 ? objective[key] + 1 : 0;
            io.emit('state', { objectives });
        }
    });
}

module.exports = {
    init: function(ioConnection, config) {
        io = ioConnection;

        // Setup game files.
        for (const fileConfig of config.files) {
            const { namespace, team, filename } = fileConfig;
            const gameFile = new GameFile(io.of(namespace), fileConfig);

            gameFile.on('commit', () => {
                io.emit('reload', team);
            });

            files.set(filename, gameFile);
        }

        io.on('connection', onConnection);
    },

    getFile: function(filename) {
        return files.get(filename);
    },
};
