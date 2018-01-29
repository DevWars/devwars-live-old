const path = require('path');
const { Router } = require('express');

const router = new Router();

function serveApp(req, res) {
    res.sendFile(path.join(__dirname, '../../../public/index.html'));
}

router.get('/play/:team(blue|red)/*', serveApp);
router.get('/broadcast', serveApp);

module.exports = router;
