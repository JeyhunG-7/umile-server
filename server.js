require('dotenv').config({ path: '.env' });
var { app } = require('./app');

const port = process.env.PORT;

// Server 
app.listen(port, () => console.log(`Server is listening at http://localhost:${port}`));