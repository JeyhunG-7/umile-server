const api = require('express')();

api.use(`/admin/`, require('./admin'));

module.exports = api;