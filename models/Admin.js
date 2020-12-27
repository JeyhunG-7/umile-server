const { builder, TABLES } = require("./Database");


exports.findAdminByEmail = function(email) {
    return new Promise((resolve, reject) => {
        builder()
            .select('*')
            .from(TABLES.admins)
            .where({email: email})
            .then(resolve)
            .catch(reject);
    });
}