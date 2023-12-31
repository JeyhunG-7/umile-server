const { builder, TABLES } = require('./Database');
var jwt = require('jsonwebtoken');
const jwt_secret = process.env.JWT_SECRET;

exports.addTokenId = function(id){
    return new Promise((resolve, reject) => {
        builder()
        .insert({token_id: id})
        .table(TABLES.auth)
        .then(resolve)
        .catch(reject)
    });
}

exports.findTokenId = function(id){
    return new Promise((resolve, reject) => {
        builder()
        .table(TABLES.auth)
        .where({token_id: id})
        .then(resolve)
        .catch(reject)
    });
}

exports.removeTokenId = function(id){
    return new Promise((resolve, reject) => {
        builder()
        .del()
        .table(TABLES.auth)
        .where({token_id: id})
        .then(resolve)
        .catch(reject)
    });
}

exports.createToken = function(payload, expire){
    var options = { algorithm: 'HS256' };

    if (expire){
        options.expiresIn = expire;
    }

    return jwt.sign(payload, jwt_secret, options);
}

exports.decodeToken = function(token){
    return jwt.decode(token, jwt_secret);
}