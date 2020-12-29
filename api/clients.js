const router = require('express').Router();
const ResponseBuilder = require('../helpers/ResponseBuilder');
const Validator = require('../helpers/Validator');
const { decodeToken } = require('../helpers/Token');
const Password = require('../helpers/Password');
const { addClientAsync, updatePasswordForClientAsync } = require('../models/Client');
const password = require('../models/Authentication').passport,
    { logout, authenticationWith } = require('../models/Authentication');

const { Log } = require('./Logger'),
    logger = new Log('ClientAPI');


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
        await addClientAsync(email, first_name, last_name, company_name, phone, passwordHash);
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
        await updatePasswordForClientAsync(email, passwordHash);
    } catch (e) {
        logger.error(`Couldn't update database: ${JSON.stringify(e)}`);
        return ResponseBuilder.sendError(req, res, "Something went wrong while resetting password", "Couldn't update database");
    }

    return ResponseBuilder.sendSuccess(req, res, "Password was successfully reset");
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