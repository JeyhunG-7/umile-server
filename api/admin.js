const router = require('express').Router();
const ResponseBuilder = require('../helpers/ResponseBuilder');
const { logout, authenticationWith } = require('../models/Authentication');
const Validator = require('../helpers/Validator');
const { createToken } = require('../helpers/Token');


router.post('/login', authenticationWith('admin-local'), function (req, res) {
    return ResponseBuilder.sendSuccess(req, res, req.user.token);
});

router.post('/logout', authenticationWith('jwt'), async function (req, res) {
    await logout(req.user.id);
    return ResponseBuilder.sendSuccess(req, res);
});

router.post('/createinvitation', authenticationWith('jwt'), async function (req, res) {
    const validateError = Validator.verifyParams(req.body, { email: 'email', first_name: 'string' });
    if (validateError) return ResponseBuilder.sendSuccess(req, res, 'Request is missing params!', validateError);    

    var { email, first_name } = req.body;
    var token = createToken({email: email, first_name: first_name});

    //TODO: create invitation link?
     
    return ResponseBuilder.sendSuccess(req, res, token);
});

module.exports = router;