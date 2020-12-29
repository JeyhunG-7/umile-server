const { builder, TABLES } = require("./../helpers/Database");


exports.addClientAsync = function(email, first_name, last_name, company_name, phone, pwd_hash) {
    return new Promise((resolve, reject) => {
        builder()
            .table(TABLES.clients)
            .insert({email: email, first_name: first_name, last_name: last_name, company_name: company_name, phone: phone, pwd_hash: pwd_hash})
            .then(resolve)
            .catch(reject);
    });
}

exports.findClientByEmail = function(email) {
    return new Promise((resolve, reject) => {
        builder()
            .select('*')
            .from(TABLES.clients)
            .where({email: email})
            .then(resolve)
            .catch(reject);
    });
}