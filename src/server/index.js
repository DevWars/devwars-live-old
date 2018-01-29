const config = require('config');
const server = require('./server');

server.init();

const port = config.get('port');
server.server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
