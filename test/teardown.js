const { builder } = require('./../helpers/Database');

module.exports = async function() {
    console.log('Closing database connection...');
    try{
        builder().destroy();
    } catch(e){
        console.log('Error while closing database connection: ', e);
    }
}