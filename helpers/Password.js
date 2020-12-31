const bcrypt = require('bcrypt');
const saltRound = 10;
const { Log } = require('./Logger'),
    logger = new Log('Password');

async function createHashAsync(password){
    const salt = await bcrypt.genSalt(saltRound);
    return bcrypt.hash(password, salt);
}

async function compareAsync(password, dbHash){
    try {
        var match = await bcrypt.compare(password, dbHash);
        return match;
    } catch (e){
        logger.error(`Error while comparing password and hash: ${JSON.stringify(e)}`);
        return false;
    }
}

module.exports = { createHashAsync, compareAsync }