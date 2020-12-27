const api = require('express')();

api.use(`/admin/`, require('./admin'));
api.use(`/clients/`, require('./clients'));

module.exports = api;