const router = require('express').Router();
const Logger = require('../models/Logger');
const Validator = require('../models/Validator');

router.post('/login', async function (req, res) {

    const validateError = Validator.verifyParams(req.body, { email: 'email', pwd: 'string' });
    if (validateError) return Logger.sendError(req, res, 'Request is missing params!', validateError);

    const { email, pwd } = req.body;

    //more logic here

    return Logger.sendSuccess(req, res);
});

module.exports = router;