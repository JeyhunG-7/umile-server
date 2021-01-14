const { builder, TABLES } = require("./../helpers/Database");


exports.getInTouchEntry = function(email, name, message) {
    return new Promise((resolve, reject) => {
        builder()
            .table(TABLES.contactus_messages)
            .insert({email, name, message})
            .then(resolve)
            .catch(reject);
    });
}