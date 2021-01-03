require('dotenv').config({ path: '.env' });

const port = process.env.PORT;

const app = require('express')();
const bodyParser = require('body-parser');
const cors = require('cors');

// Express middlewares
app.use(
  cors(),
  bodyParser.urlencoded({ extended: false }),
  bodyParser.json()
);

//API endpoints
app.use(`/`, require('./api/init'));

// Server 
app.listen(port, () => console.log(`Server is listening at http://localhost:${port}`));