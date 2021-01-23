const router = require('express').Router();
const ResponseBuilder = require('../helpers/ResponseBuilder');
const Validator = require('../helpers/Validator');
const { authenticationWith } = require('../models/Authentication');
const { builder, TABLES, incubate } = require('../helpers/Database');

router.get('/search', authenticationWith('jwt-client'), async function (req, res) {
    const validateError = Validator.verifyParams(req.query, { term: 'string' });
    if (validateError) return ResponseBuilder.sendError(req, res, 'Request is missing params!', validateError);

    const { term } = req.query;

    try {
        const placeIds = await builder().table(TABLES.places)
            .whereRaw("lower(address) LIKE lower(? || '%')", [term])
            .select('id', 'address').limit(5);

        return ResponseBuilder.sendSuccess(req, res, placeIds);
    } catch (error) {
        console.error(error.message);
        return ResponseBuilder.sendError(req, res, error.message);
    }
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

    try {
        const placeIds = await builder().table(TABLES.places)
            .where("provider_id", providerId)
            .select('id');

        if (placeIds.length > 0) return ResponseBuilder.sendError(req, res, 'Duplicate provider id');

        const query = `
            INSERT INTO places(address, type, provider_id, geom)
            VALUES ('${address}', '${type}', '${providerId}', 
            POINT(${lng}, ${lat})::geometry)
            RETURNING id;`

        const result = await incubate(query);
        if (!result) return ResponseBuilder.sendError(req, res, 'Error while saving a place');

        return ResponseBuilder.sendSuccess(req, res, result[0].id);
    } catch (error) {
        console.error(error.message);
        return ResponseBuilder.sendError(req, res, 'Error while saving a place', error.message);
    }
});

module.exports = router;