const config = require('config');
const { Router } = require('express');

const router = new Router();

function serveApp(req, res) {
    res.render('index', { SOCKET_URL: config.get('socketUrl') });
}

router.get('/', serveApp);
router.get('/play/:team(blue|red)/*', serveApp);
router.get('/broadcast', serveApp);

module.exports = router;
