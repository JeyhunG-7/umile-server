var log = require('./logger').log;

var Query = {
  getHellowWorld: getHellowWorldFunc 
};

function getHellowWorldFunc(){
  return "Hello World";
}


module.exports = { Query }