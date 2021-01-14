const api = require('express')();

api.use(`/admin/`, require('./admin'));
api.use(`/clients/`, require('./clients'));
api.use(`/model/`, require('./model'));
api.use(`/contact/`, require('./contact'));

module.exports = api;