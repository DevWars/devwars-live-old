const { Router } = require('express');
const game = require('../game');

const router = Router();

router.get('/:filename', (req, res) => {
	const gameFile = game.getFile(req.params.filename);
	if (!gameFile) {
		return res.sendStatus(404);
	}

	res.type(gameFile.language);
	res.send(gameFile.getCommitText());
});

module.exports = router;
