const router = require('express').Router();
const ResponseBuilder = require('../helpers/ResponseBuilder');
const { logout, authenticationWith } = require('../models/Authentication');
const Validator = require('../helpers/Validator');
const { createToken } = require('../helpers/Token');
const { sendSignupEmail } = require('./../helpers/SendGrid');
const { DOMAIN_NAME } = require('./../helpers/Constants');


router.post('/login', authenticationWith('admin-local'), function (req, res) {
    return ResponseBuilder.sendSuccess(req, res, req.user.token);
});

router.post('/logout', authenticationWith('jwt'), async function (req, res) {
    await logout(req.user.id);
    return ResponseBuilder.sendSuccess(req, res);
});

router.post('/createinvitation', authenticationWith('jwt'), async function (req, res) {
    const validateError = Validator.verifyParams(req.body, { email: 'email', first_name: 'string' });
    if (validateError) return ResponseBuilder.sendError(req, res, 'Missing params!', validateError);

    var { email, first_name } = req.body;
    var token = createToken({email: email, first_name: first_name});

    //TODO: create invitation link?
    var reply = await sendSignupEmail(email, first_name, `${DOMAIN_NAME}/signup/${token}`);
     
    return reply ? ResponseBuilder.sendSuccess(req, res) : ResponseBuilder.sendError(req, res, "Error while creating signup email");
});

module.exports = router;