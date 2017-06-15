const GameFile = require('./game-file');

let io = null;
const files = new Map();
let viewers = 0;

function onConnection(socket) {
	viewers += 1;

	socket.on('disconnect', () => {
		viewers -= 1;
	});
}

module.exports = {
	init: function(io, config) {
		io = io;

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
