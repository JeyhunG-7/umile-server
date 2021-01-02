require('dotenv').config({ path: '.env.test' });

const { incubate } = require('./../helpers/Database');
const fs = require('fs');

module.exports = async function() {
    
    try{
    var query = fs.readFileSync('./create.sql');
    await incubate(query.toString());
    console.log('Setup database for tests...');
    } catch(e){
        console.error('Something went wrong while setting up database: ', e);
    }
}