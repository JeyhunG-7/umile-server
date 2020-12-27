const router = require('express').Router();
const Logger = require('../models/Logger');

const Validator = require('../models/Validator');
const { decodeToken } = require('../models/Token');
router.post('/signup', function (req, res) {

    return Logger.sendSuccess(req, res);
});

router.post('/validate', function (req, res) {
    const validateError = Validator.verifyParams(req.body, { token: 'string' });
    if (validateError) return Logger.sendSuccess(req, res, 'Request is missing params!', validateError);    

    return isTokenValid(req.body.token) ? Logger.sendSuccess(req, res) : Logger.sendError(req, res);
});

function isTokenValid(token){
    var payload = decodeToken(token);
    return payload;
}

module.exports = router;