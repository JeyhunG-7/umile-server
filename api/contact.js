const router = require('express').Router();
const ResponseBuilder = require('../helpers/ResponseBuilder');
const Validator = require('../helpers/Validator');
const Contact = require('../models/Contact');

const { Log } = require('./../helpers/Logger'),
    logger = new Log('ContactAPI');


router.post('/getintouch', async function (req, res) {
    const validateError = Validator.verifyParams(req.body, { 
        name: 'string',
        email: 'email',
        message: 'string'
    });
    if (validateError) {
        return ResponseBuilder.sendError(req, res, 'Request is missing params!', validateError);
    }

    var {email, name, message} = req.body;

    if(message.length > 160) {
        return ResponseBuilder.sendError(req, res, 'Message to long!', 'Message to long!');
    }

    try{
        await Contact.getInTouchEntry(email, name, message);
        return ResponseBuilder.sendSuccess(req, res);
    } catch(e){
        logger.error(`Couldn't update database: ${JSON.stringify(e)}`);
        return ResponseBuilder.sendError(req, res, 'Error while updating database', 'Something went wrong while updating records');
    }
});

module.exports = router;