const router = require('express').Router();
const ResponseBuilder = require('../helpers/ResponseBuilder');
const Validator = require('../helpers/Validator');
const { decodeToken, createToken } = require('../helpers/Token');
const Password = require('../helpers/Password');
const Client = require('../models/Client');
const { logout, authenticationWith } = require('../models/Authentication');
const SendGrid = require('./../helpers/SendGrid');
const { DOMAIN_NAME } = require('./../helpers/Constants');

const { Log } = require('./../helpers/Logger'),
    logger = new Log('ClientsAPI');


router.post('/signup', async function (req, res) {
    const validateError = Validator.verifyParams(req.body, {
        email: 'email',
        first_name: 'string',
        last_name: 'string',
        company_name: 'string',
        phone: 'string',
        token: 'string',
        password: 'string'
    });
    if (validateError) return ResponseBuilder.sendError(req, res, 'Request is missing params!', validateError);

    const { email, first_name, last_name, company_name, phone, token, password } = req.body;

    let token_payload = isTokenValid(token);
    if (!token_payload) {
        return ResponseBuilder.sendError(req, res, "Not a valid token");
    }

    if (token_payload.email !== email) {
        return ResponseBuilder.sendError(req, res, "Not match email");
    }

    var passwordHash = await Password.createHashAsync(password);
    if (!passwordHash) {
        return ResponseBuilder.sendError(req, res, "Something went wrong while creating account");
    }

    try {
        await Client.addClientAsync(email, first_name, last_name, company_name, phone, passwordHash);
    } catch (e) {
        if (e.message.includes('duplicate key')) {
            return ResponseBuilder.sendError(req, res, "Record already exists");
        }
        return ResponseBuilder.sendError(req, res, "Something went wrong while creating account");
    }

    return ResponseBuilder.sendSuccess(req, res, "Account was successfully created");
});

router.post('/validate', function (req, res) {
    const validateError = Validator.verifyParams(req.body, { token: 'string' });
    if (validateError) return ResponseBuilder.sendError(req, res, 'Request is missing params!', validateError);

    return isTokenValid(req.body.token) ? ResponseBuilder.sendSuccess(req, res) : ResponseBuilder.sendError(req, res);
});

router.post('/login', authenticationWith('client-local'), function (req, res) {
    return ResponseBuilder.sendSuccess(req, res, req.user.token);
});

router.get('/login', authenticationWith('jwt'), function (req, res) {
    return ResponseBuilder.sendSuccess(req, res);
});

router.post('/logout', authenticationWith('jwt'), async function (req, res) {
    await logout(req.user.id);
    return ResponseBuilder.sendSuccess(req, res);
});

router.post('/forgotpassword', async function (req, res) {
    const validateError = Validator.verifyParams(req.body, {
        password:   'string',
        token:      'string',
    });
    if (validateError) return ResponseBuilder.sendError(req, res, 'Request is missing params!', validateError);

    const { token, password } = req.body;

    let token_payload = isTokenValid(token);
    if (!token_payload || !token_payload.email) {
        return ResponseBuilder.sendError(req, res, "Not a valid token");
    }

    var passwordHash = await Password.createHashAsync(password);
    if (!passwordHash) {
        return ResponseBuilder.sendError(req, res, "Something went wrong while resetting password", "Couldn't create password hash");
    }

    try {
        await Client.updatePasswordForClientAsync(email, passwordHash);
    } catch (e) {
        logger.error(`Couldn't update database: ${JSON.stringify(e)}`);
        return ResponseBuilder.sendError(req, res, "Something went wrong while resetting password", "Couldn't update database");
    }

    return ResponseBuilder.sendSuccess(req, res, "Password was successfully reset");
});

router.post('/emailforgotpassword', async function (req, res) {
    const validateError = Validator.verifyParams(req.body, {
        email:   'email',
    });
    if (validateError) return ResponseBuilder.sendError(req, res, 'Request is missing params!', validateError);

    const { email } = req.body;

    var userFacingMessage = `Email will be sent to ${email} if it is registered`;

    try{
        var result = await Client.findClientByEmail(email);
        if (result && result.length !== 1) {
            return ResponseBuilder.sendSuccess(req, res, userFacingMessage);
        }
        var user = result[0];
    } catch (e){
        logger.error(`Error while getting client by email : ${JSON.stringify(e)}`);
        return ResponseBuilder.sendSuccess(req, res, userFacingMessage);
    }

    var token = createToken({email: email}, '30m');
    
    var full_name = `${user.first_name} ${user.last_name}`;
    if (full_name === '' || full_name.length <= 3){
        full_name = email;
    }

    var resetLink = `${DOMAIN_NAME}/resetpassword/${token}`;
    SendGrid.sendResetPasswordEmail(email, full_name, resetLink);
    
    return ResponseBuilder.sendSuccess(req, res, userFacingMessage);
});

function isTokenValid(token) {
    try {
        var payload = decodeToken(token);

        if (Date.now() >= payload.exp * 1000) {
            return false;
        }

        return payload;
    } catch (e) {
        return false;
    }

}

module.exports = router;