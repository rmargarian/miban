const express     = require('express');
const path        = require('path');
const http        = require('http');
const compression = require('compression');
const bodyParser  = require('body-parser');
const passport    = require('passport');
const app         = express();
const server      = http.createServer(app);

// Get our API routes
const api         = require('./app/routes/api');
require('./app/services/passport');
const CONFIG      = require('./app/config/config');

/**Unsubscribes api */
//const ipamServise      = require('./app/services/unsub-imap.service');
const unsubscribeController = require('./app/controllers/unsubscribes.controller');
const router = express.Router();
router.post('/unsubscribe', unsubscribeController.create);
app.use('/', router);


/**Generate png for email sending */
//const faceServise      = require('./app/services/faces.service');
//faceServise.generateFace();

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

// [SH] Initialise Passport before using the route middleware
app.use(passport.initialize());
const port = CONFIG.port;
app.set('port', port);

if(CONFIG.env === 'development') {
  // Point static path to public
  app.use(express.static(path.join(__dirname, 'public')));
} else {
  app.use(express.static(path.join(__dirname, 'dist/pfa-negotiations-app')));
}
app.use(compression());

//Log Env
console.log("***************Environment:", CONFIG.env);
//DATABASE
const models = require("./app/models");
models.sequelize.authenticate().then(() => {
  console.log('Connected to SQL database:', CONFIG.db_name);
})
.catch(err => {
  console.error('Unable to connect to SQL database:' ,CONFIG.db_name, err);
});

// Set our api routes
app.use('/api', api);
// error handler
app.use(function(err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).send({
      success: false,
      message: 'No token provided.',
      statusText: 'Unauthorized'
    });
  }
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const index_file = CONFIG.env === 'development' ? 'public/index.html' : 'dist/pfa-negotiations-app/index.html';
// Catch all other routes and return the index file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, index_file));
});

// Listen on provided port, on all network interfaces.
server.listen(port, () => console.log(`API running on localhost:${port}`));
