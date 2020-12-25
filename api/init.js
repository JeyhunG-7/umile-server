const api = require('express')();

api.use(`/user/`, require('./user'));
api.use(`/order/`, require('./order'));

module.exports = api;