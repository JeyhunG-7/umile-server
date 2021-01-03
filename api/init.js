const api = require('express')();

api.use(`/admin/`, require('./admin'));
api.use(`/model/`, require('./model'));

module.exports = api;