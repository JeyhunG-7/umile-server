const { builder, TABLES } = require('./Database');

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