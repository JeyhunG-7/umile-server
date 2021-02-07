const router = require('express').Router();
const ResponseBuilder = require('../helpers/ResponseBuilder');
const Order = require('../models/Order');
const Validator = require('../helpers/Validator');
const { authenticationWith } = require('../models/Authentication');

router.get('/list', authenticationWith('jwt-client'), async function (req, res) {

    const validateError = Validator.verifyParams(req.query, { cityId: 'number', active: 'boolean' });
    if (validateError) return ResponseBuilder.sendError(req, res, 'Request is missing params!', validateError);

    const { cityId, active } = req.query;
    const clientId = req.user.account.id;

    const result = await Order.clientOrders(clientId, cityId, active === 'true');
    if (!result) return ResponseBuilder.sendError(req, res, 'Error while getting list of orders');

    return ResponseBuilder.sendSuccess(req, res, result);
});

router.post('/place', authenticationWith('jwt-client'), async function (req, res) {

    const validateError = Validator.verifyParams(req.body, {
        cityId: 'number',
        pickup: { note: 'string', placeId: 'integer' },
        dropoff: { note: 'string', placeId: 'integer', customer_name: 'string', customer_phone: 'string' }
    });

    if (validateError) return ResponseBuilder.sendError(req, res, 'Request is missing params!', validateError);

    const clientId = req.user.account.id;

    const { cityId, pickup, dropoff } = req.body;

    const result = await Order.placeOrder(clientId, cityId, pickup, dropoff);
    if (result) return ResponseBuilder.sendSuccess(req, res, result);

    return ResponseBuilder.sendError(req, res, 'Error while placing order');
});


module.exports = router;