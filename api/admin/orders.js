const router = require('express').Router();
const ResponseBuilder = require('../../helpers/ResponseBuilder');
const Admin = require('../../models/Admin');
const Validator = require('../../helpers/Validator');

router.get('/list', async function (req, res) {
    const validateError = Validator.verifyParams(req.query, { cityId: 'number', active: 'boolean' });
    if (validateError) return ResponseBuilder.sendError(req, res, 'Missing params!', validateError);

    const { cityId, active } = req.query;

    const result = await Admin.allOrders(cityId, active === 'true');
    if (!result) return ResponseBuilder.sendError(req, res, 'Error while getting list of orders');

    return ResponseBuilder.sendSuccess(req, res, result);
});

router.post('/changeStatus', async function (req, res) {
    const validateError = Validator.verifyParams(req.body, { orderId: 'integer', statusId: 'integer' });
    if (validateError) return ResponseBuilder.sendError(req, res, 'Missing params!', validateError);

    const { orderId, statusId } = req.body;

    const result = await Admin.updateOrderStatus(orderId, statusId);
    if (!result) return ResponseBuilder.sendError(req, res, 'Error while changing order status');

    return ResponseBuilder.sendSuccess(req, res);
});

router.get('/statuses', async function (req, res) {
    const result = await Admin.getAllStatuses();
    if (!result) return ResponseBuilder.sendError(req, res, 'Error while getting list of order statuses');

    return ResponseBuilder.sendSuccess(req, res, result);
});

module.exports = router;