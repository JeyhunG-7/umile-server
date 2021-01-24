const router = require('express').Router();
const ResponseBuilder = require('../helpers/ResponseBuilder');
const Validator = require('../helpers/Validator');
const { authenticationWith } = require('../models/Authentication');
const Place = require('../models/Place');

router.get('/search', authenticationWith('jwt-client'), async function (req, res) {
    const validateError = Validator.verifyParams(req.query, { term: 'string' });
    if (validateError) return ResponseBuilder.sendError(req, res, 'Request is missing params!', validateError);

    const { term } = req.query;

    const result = await Place.search(term);
    if (!result) return ResponseBuilder.sendError(req, res, 'Error while searching place');

    return ResponseBuilder.sendSuccess(req, res, result);
});

router.post('/save', authenticationWith('jwt-client'), async function (req, res) {
    const validateError = Validator.verifyParams(req.body, {
        providerId: 'string',
        address: 'string',
        type: 'string',
        lat: 'number',
        lng: 'number'
    });

    if (validateError) return ResponseBuilder.sendError(req, res, 'Request is missing params!', validateError);

    const { providerId, address, type, lat, lng } = req.body;

    const placeId = await Place.save(providerId, address, type, lat, lng);
    if (!placeId) return ResponseBuilder.sendError(req, res, 'Error while saving place');

    return ResponseBuilder.sendSuccess(req, res, placeId);
});

module.exports = router;