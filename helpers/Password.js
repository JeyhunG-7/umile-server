const bcrypt = require('bcrypt');
const saltRound = 10;

async function createHashAsync(password){
    const salt = await bcrypt.genSalt(saltRound);
    return bcrypt.hash(password, salt);
}

async function compare(password, dbHash){
    try {
        var match = await bcrypt.compare(password, dbHash);
        return match;
    } catch (e){
        //TODO: Log error for debugging
        return false;
    }
}

module.exports = { createHashAsync, compare }