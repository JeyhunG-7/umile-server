const { expressLogger } = require('./helpers/Logger');

const app = require('express')();
const bodyParser = require('body-parser');
const cors = require('cors');
const password = require('./models/Authentication').passport;

// Express middlewares
app.use(
  cors(),
  bodyParser.urlencoded({ extended: false }),
  bodyParser.json(),
  password.initialize()
);

// Logger
app.use(expressLogger);

//API endpoints
app.use(`/api/`, require('./api/init'));
// app.use(`/`, require('./api/init')); //For Chingiz's local setup

exports.app = app;