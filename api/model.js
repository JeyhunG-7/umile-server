const axios = require('axios');
const router = require('express').Router();
const Logger = require('../models/Logger');
const Validator = require('../models/Validator');
const Database = require('../models/Database');
const Scheduler = require('../models/Scheduler');

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

router.post('/submitOrder', async function (req, res) {
    const validateError = Validator.verifyParams(req.body, { pickup: 'number', deliver: 'array' });
    if (validateError) return Logger.sendSuccess(req, res, 'Request is missing params!', validateError);

    const cityId = 1, clientId = 1;

    const { pickup, deliver } = req.body;

    try {
        const obj = { city_id: cityId, client_id: clientId }

        const order = await Database.builder().table('orders').insert(obj).returning('id');

        const orderId = order[0];

        const pickupObj = { order_id: orderId, action_id: 1, place_id: pickup }

        await Database.builder().table('nodes').insert(pickupObj);

        for (const placeId of deliver) {
            const deliverObj = { order_id: orderId, action_id: 2, place_id: placeId }

            await Database.builder().table('nodes').insert(deliverObj);
        }

    } catch (error) {
        console.error(error.message);
    }

    return Logger.sendSuccess(req, res);
});

router.get('/randomPoints', async function (req, res) {
    const validateError = Validator.verifyParams(req.query, { n: 'number' });
    if (validateError) return Logger.sendSuccess(req, res, 'Request is missing params!', validateError);

    const cityId = 1;
    const result = [];

    const { n } = req.query;

    let placesToGenerate = n;
    while (placesToGenerate > 0) {
        const points = await randomPoints(cityId, placesToGenerate);

        let failed = 0;
        for (const { lat, lng } of points) {
            const id = await reverseGeocode(lat, lng);

            if (id) result.push(id);
            if (!id) failed++;
        }

        placesToGenerate = failed;
    }

    return Logger.sendSuccess(req, res, result);
});

router.get('/run', async function (req, res) {
    const result = await Scheduler.run(1);
    return Logger.sendSuccess(req, res, result);
});

router.get('/order/delete', async function (req, res) {
    const validateError = Validator.verifyParams(req.query, { id: 'number' });
    if (validateError) return Logger.sendSuccess(req, res, 'Request is missing params!', validateError);

    const { id } = req.query;

    try {
        await Database.builder().table('orders').where('id', id).delete();
    } catch (error) {
        console.error(error.message);
        return Logger.sendError(req, res, error.message);
    }

    return Logger.sendSuccess(req, res);
});

router.get('/order/deleteAll', async function (req, res) {

    try {
        await Database.builder().table('orders').delete();
    } catch (error) {
        console.error(error.message);
        return Logger.sendError(req, res, error.message);
    }

    return Logger.sendSuccess(req, res);
});

router.get('/routes', async function (req, res) {

    const query = `
    SELECT routes.id, routes.full,
        routes.duration AS "totalDuration",
        routes.distance AS "totalDistance",
        SUM(CASE WHEN nodes.action_id=1 THEN 1 ELSE 0 END)::integer AS pickups,
        SUM(CASE WHEN nodes.action_id=2 THEN 1 ELSE 0 END)::integer AS deliveries,
        SUM(places.viscosity) AS "handlingTime",
        jsonb_build_object(
            'type', 'Feature',
            'id',	routes.id,
            'properties', '{}'::json,
            'geometry',	ST_AsGeoJson(ST_MakeLine(places.geom))::json
        ) AS geojson
    FROM route_nodes rn
    INNER JOIN routes ON routes.id=rn.route_id
    INNER JOIN nodes ON rn.node=nodes.id
    INNER JOIN places ON nodes.place_id=places.id
    GROUP BY 1, 2;`

    const result = await Database.incubate(query);
    if (!result) return Logger.sendError(req, res);

    return Logger.sendSuccess(req, res, result);
});

router.get('/orders', async function (req, res) {
    const cityId = 1;

    const query = `
    SELECT
        sub.order_id AS id, sub.scheduled,
        json_object_agg(sub.action, sub.array_agg ORDER BY sub.action DESC) AS places
    FROM (
        SELECT DISTINCT
            order_id, actions.short_name AS action,
            rn.id IS NOT NULL AS scheduled,
            array_agg(jsonb_build_object(
                'placeId', nodes.place_id,
                'geometry', ST_AsGeoJson(places.geom)::json
            ))
        FROM nodes
        INNER JOIN orders ON orders.id=nodes.order_id
        INNER JOIN places ON places.id=nodes.place_id
        INNER JOIN actions ON actions.id=nodes.action_id
        LEFT JOIN route_nodes rn ON rn.node=nodes.id
        WHERE orders.city_id=$1
        GROUP BY 1, 2, 3
    ) AS sub
    GROUP BY 1, 2;`

    const result = await Database.incubate(query, { params: [cityId] });
    if (!result) return Logger.sendError(req, res);

    return Logger.sendSuccess(req, res, result);
});

router.get('/route/delete', async function (req, res) {
    const validateError = Validator.verifyParams(req.query, { id: 'number' });
    if (validateError) return Logger.sendSuccess(req, res, 'Request is missing params!', validateError);

    const { id } = req.query;

    try {
        await Database.builder().table('routes').where('id', id).delete();
    } catch (error) {
        console.error(error.message);
        return Logger.sendError(req, res, error.message);
    }

    return Logger.sendSuccess(req, res);
});

router.get('/route/full', async function (req, res) {
    const validateError = Validator.verifyParams(req.query, { id: 'number', flag: 'boolean' });
    if (validateError) return Logger.sendSuccess(req, res, 'Request is missing params!', validateError);

    const { id, flag } = req.query;

    try {
        await Database.builder().table('routes').where('id', id).update('full', flag);
    } catch (error) {
        console.error(error.message);
        return Logger.sendError(req, res, error.message);
    }

    return Logger.sendSuccess(req, res);
});

const randomPoints = async (cityId, nPoints) => {

    const query = `
    WITH points AS (
        SELECT (ST_Dump(ST_GeneratePoints(geom, $1))).geom
        FROM cities WHERE id=$2
    )
    SELECT ST_X(geom) AS lng, ST_Y(geom) AS lat
    FROM points;`

    return await Database.incubate(query, { params: [nPoints, cityId] });
}

const reverseGeocode = async (lat, lng) => {
    const res = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`);

    if (res.status === 200 && res.data && res.data.status === 'OK' && res.data.results && res.data.results.length > 0) {

        const data = res.data.results[0];

        const { location } = data.geometry;
        const providerId = data.place_id;
        const type = data.types[0];
        const address = data.formatted_address;

        try {
            const exists = await Database.builder().table('places').select('id').where({ provider_id: providerId });

            if (exists.length === 1) return exists[0].id;

            const query = `
            INSERT INTO places(address, type, provider_id, geom)
            VALUES ('${address}', '${type}', '${providerId}', 
            POINT(${location.lng}, ${location.lat})::geometry)
            RETURNING id;`

            const result = await Database.incubate(query);

            return result[0].id;
        } catch (error) {
            console.error(error.message);
        }

    } else {
        console.debug('No reverse geocode data found for', lat, lng);
    }

    return false;
}

module.exports = router;