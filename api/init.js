const api = require('express')();

api.use(`/admin/`, require('./admin/admin'));
api.use(`/clients/`, require('./clients'));
api.use(`/model/`, require('./model'));
api.use(`/places/`, require('./places'));
api.use(`/contact/`, require('./contact'));
api.use(`/orders/`, require('./orders'));

module.exports = api;