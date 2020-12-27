const router = require('express').Router();
const Logger = require('../models/Logger');
const password = require('../models/Authentication').passport,
    { logout } = require('../models/Authentication');
const Validator = require('../models/Validator');
const { createToken } = require('../models/Token');


router.post('/login', password.authenticate('admin-local', { session: false }), function (req, res) {
    return Logger.sendSuccess(req, res, req.user.token);
});

router.post('/logout', password.authenticate('admin-jwt', { session: false }), async function (req, res) {
    await logout(req.user.id);
    return Logger.sendSuccess(req, res);
});

router.post('/createinvitation', password.authenticate('admin-jwt', { session: false, failureRedirect: "/" }), async function (req, res) {
    const validateError = Validator.verifyParams(req.body, { email: 'email', first_name: 'string' });
    if (validateError) return Logger.sendSuccess(req, res, 'Request is missing params!', validateError);    

    var { email, first_name } = req.body;
    var token = createToken({email: email, first_name: first_name});

    //TODO: create invitation link?
     
    return Logger.sendSuccess(req, res, token);
});

router.get('/test', password.authenticate('admin-jwt', { session: false, failureRedirect: "/" }), async function (req, res) {
    return res.send("hello");
});

module.exports = router;