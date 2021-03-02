const pg = require('pg');
const Client = pg.Client;
const { Log } = require('./Logger'), logger = new Log('Database');

const DATABASE_NAME = process.env.DB_NAME

const _pgSettings = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
};

const TABLES = {
    admins:     'admins',
    auth:       'auth',
    clients:    'clients',
    contactus_messages: 'contactus_messages',
    places: 'places',
    orders: 'orders',
    nodes: 'nodes',
    order_status_log: 'order_status_log',
    order_status: 'order_status'
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
    log: {
        warn(message) {
            logger.warn(message);
         },
        error(message) { 
            logger.error(message);
        },
        deprecate(message) { 
            logger.info(message);
        },
        debug(message) { 
            logger.debug(message);
        }
    }
});

const knexPostgis = require('knex-postgis')(knex);

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

        if ((result && result.rows && result.rows.length > rowCount) || (result && result.length > rowCount)) {
            return result.rows || true; 
        }

    } catch (error) {
        logger.error(`DB Error ->`, error.message, error.hint || '');
    } finally {
        connection.end();
    }
    
    return false;
}

module.exports = { incubate, builder, TABLES, knexPostgis }

const connectToDb = async (database) => {
    let connection;

    const pgSettings = { ..._pgSettings, database }

    return new Promise(async (resolve) => {
        connection = new Client(pgSettings);

        connection.connect((err) => {
            if (err) {
                logger.error('Error while connecting to', database, err.stack);
                process.exit(1);
            } else {
                logger.debug('Connected to 127.0.0.1', database);
                resolve(connection);
            }
        });
    });
}