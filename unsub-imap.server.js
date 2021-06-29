const express     = require('express');
const http        = require('http');
const app         = express();
const server      = http.createServer(app);

const config      = require('./app/config/config');
const port = config.imap_service_port;
app.set('port', port);

//Log Env
console.log("***************Environment:", config.env);
require('./app/services/unsub-imap.service');

// Listen on provided port, on all network interfaces.
server.listen(port, () => console.log(`IMAP running on localhost:${port}`));
