require('dotenv').config({ path: '.env.test' });

process.env.DB_NAME = 'umile_test'

module.exports = async function() {

    // !IMPORTANT
    if (process.env.DB_NAME !== 'umile_test'){
        console.error('\nERROR: Database must be "umile_test"');
        process.exit();
    }
    
    try{
        
        // Need to import here so it database connection isn't initiated before DB_NAME is changed
        const { incubate } = require('./../helpers/Database');
        const fs = require('fs');

        const query = fs.readFileSync('./database_scripts/create.sql');
        const result = await incubate(query.toString());

        if (!result){
            console.error("\nERROR: Couldn't create tables in database");
            process.exit();
        }

        const sampleDataQuery = fs.readFileSync('./database_scripts/sample_data.sql');
        const sampleDataResult = await incubate(sampleDataQuery.toString());

        if (!sampleDataResult){
            console.error("\nERROR: Couldn't add sample data to created tables");
            process.exit();
        }

        console.log('Setup database for tests...');
    } catch(e){
        console.error('Something went wrong while setting up database: ', e);
        process.exit();
    }
}