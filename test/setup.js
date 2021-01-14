require('dotenv').config({ path: '.env.test' });

const { incubate } = require('./../helpers/Database');
const fs = require('fs');

module.exports = async function() {

    // !IMPORTANT
    if (process.env.DB_NAME !== 'umile_test'){
        console.error('\nERROR: Database must be "umile_test"');
        process.exit();
    }
    
    try{
        var query = fs.readFileSync('./database_scripts/create.sql');
        var result = await incubate(query.toString());
        if (!result){
            console.error("\nERROR: Couldn't create tables in database");
            process.exit();
        }
        console.log('Setup database for tests...');
    } catch(e){
        console.error('Something went wrong while setting up database: ', e);
    }
}