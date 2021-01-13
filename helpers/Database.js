const pg = require('pg');
const Client = pg.Client;

const DATABASE_NAME = process.env.DB_NAME

const _pgSettings = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
};

const TABLES = {
    admins:     'admins',
    auth:       'auth',
    clients:    'clients'
}

/**
 * http://knexjs.org/
 * Will be used for simple queries for
 * read, update, insert, delete operations
 * 
 * Examples:
 * const incubateResult = await incubate('SELECT * FROM admins');
 * const builderResult = await builder().select().from('admins');
 * 
 */
const knex = require('knex')({
    client: 'pg',
    connection: { ..._pgSettings, database: DATABASE_NAME },
    // log: {  TODO: after logger set connect these logs to Logger
    //     warn(message) { },
    //     error(message) { },
    //     deprecate(message) { },
    //     debug(message) { }
    // }
});

/**
 * Returns knex query buidler object
 */
const builder = () => knex;

/**
 * Runs given query and optional params
 * @param {*} query - raw query to run
 * @param {*} options - options object 
 */
const incubate = async (query, { params = undefined, rowCount = -1 } = {}) => {
    const connection = await connectToDb(DATABASE_NAME);

    try {
        const result = await connection.query({ text: query, values: params });

        if (result && result.rows.length > rowCount) return result.rows;

    } catch (error) {
        console.error(`DB Error ->`, error.message, error.hint || '');
    } finally {
        connection.end();
    }

    return false;
}

module.exports = { incubate, builder, TABLES }

const connectToDb = async (database) => {
    let connection;

    const pgSettings = { ..._pgSettings, database }

    return new Promise(async (resolve) => {
        connection = new Client(pgSettings);

        connection.connect((err) => {
            if (err) {
                console.error('Error while connecting to', database, err.stack);
                process.exit(1);
            } else {
                // console.debug('Connected to 127.0.0.1', database);
                resolve(connection);
            }
        });
    });
}