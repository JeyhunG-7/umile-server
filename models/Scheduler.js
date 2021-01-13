const axios = require('axios');
const Database = require('../helpers/Database');

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

const run = async (cityId, weights, dirBiasedTowards) => {

    const cleanupResult = await cleanNonCompleteRoutes();
    if (!cleanupResult) return false;

    const orders = await getOutstandingOrders(cityId);
    if (!orders || orders.length === 0) return false;

    let pickupOrderMap = {}, placesInfo = {}, allPlaces = [];
    orders.forEach(({ data }) => {
        const pickup = data[0].places[0];
        const deliver = data[1].places;

        const deliveries = [];
        deliver.forEach(({ placeId, nodeId, providerId }) => {
            deliveries.push(placeId);
            placesInfo[placeId] = { nodeId, providerId };
        });

        allPlaces.push(pickup.placeId);

        allPlaces = allPlaces.concat(deliveries);

        pickupOrderMap[pickup.placeId] = deliveries;
        placesInfo[pickup.placeId] = {
            nodeId: pickup.nodeId,
            providerId: pickup.providerId
        };
    })

    if (allPlaces.length !== Object.keys(placesInfo).length) return false;

    let placesToVisit = orders.map(({ data }) => {
        if (data[0].actionId === 1) {
            return data[0].places[0].placeId;
        }
    })

    const costRouteMap = {};
    let lowestCost = Number.POSITIVE_INFINITY;

    for (const currentPlaceId of placesToVisit) {

        const optimized = await optimize(currentPlaceId, placesToVisit, allPlaces, pickupOrderMap, placesInfo, weights, dirBiasedTowards);
        if (!optimized) return false;

        const { totalDistance, totalDuration } = optimized;

        const cost = (totalDistance / 1000) * 0.01 + (totalDuration / 3600);

        if (lowestCost > cost) lowestCost = cost;

        costRouteMap[cost] = optimized;
    }

    try {
        const { totalDistance, totalDuration, nodes } = costRouteMap[lowestCost];

        const insertObj = {
            isfull: (totalDuration + 10 * 60) > 4 * 60 * 60,
            distance: totalDistance,
            duration: totalDuration
        }

        const route = await Database.builder().table('routes').insert(insertObj).returning('id');

        const routeId = route[0];

        for (const index in nodes) {
            const nodeId = nodes[index];

            const obj = { route_id: routeId, node: nodeId, seq: Number(index) + 1 }

            await Database.builder().table('route_nodes').insert(obj).returning('id');
        }

        console.log('Scheduler is Done!!');

        return true;

    } catch (error) {
        console.error(error.message);
        return false;
    }
}

const optimize = async (_currentPlaceId, _placesToVisit, _allPlaces, pickupOrderMap, placesInfo, weights, dirBiasedTowards) => {
    const routeNodes = [];

    let currentPlaceId = _currentPlaceId + 0;
    let placesToVisit = [..._placesToVisit];
    let allPlaces = [..._allPlaces];

    while (placesToVisit.length > 0) {
        routeNodes.push(currentPlaceId);

        allPlaces = allPlaces.filter(id => id !== currentPlaceId);
        placesToVisit = placesToVisit.filter(id => id !== currentPlaceId);

        if (pickupOrderMap[currentPlaceId]) {
            const placesToAdd = pickupOrderMap[currentPlaceId]
            placesToVisit = placesToVisit.concat(placesToAdd);
        }

        if (placesToVisit.length > 0) {
            const centerGeom = await centroid(dirBiasedTowards === 1 ? placesToVisit : allPlaces);
            if (!currentPlaceId) return false;

            const nextPlaceId = await nextPlaceToVisit(currentPlaceId, placesToVisit, centerGeom, weights);
            if (!nextPlaceId) return false;

            currentPlaceId = nextPlaceId;
        }
    }

    try {

        let totalDuration = 0, totalDistance = 0, previous, nodes = [];
        for (let i = 0; i < routeNodes.length; i++) {

            const current = placesInfo[routeNodes[i]];

            nodes.push(current.nodeId);

            if (!previous) {
                previous = current;
                continue;
            }

            const matrix = await googleMatrix(previous.providerId, current.providerId);
            if (!matrix) return false;

            const { duration, distance } = matrix;

            totalDuration += duration;
            totalDistance += distance;

            previous = current;
        }

        return { totalDistance, totalDuration, nodes }

    } catch (error) {
        console.error(error.message);
        return false;
    }
}

module.exports = { run }

const cleanNonCompleteRoutes = async () => {

    try {
        await Database.builder().table('routes').where('isfull', false).delete();
    } catch (error) {
        console.error(error);
        return false;
    }

    return true;
}

const getOutstandingOrders = async (cityId) => {

    const query = `
    SELECT
        sub.order_id AS "orderId",
        array_agg(jsonb_build_object(
            'actionId', sub.action_id,
            'places', sub.array_agg
        ) ORDER BY sub.action_id) AS data
    FROM (
        SELECT order_id, action_id, array_agg(jsonb_build_object(
                'nodeId', nodes.id,
                'providerId', places.provider_id,
                'placeId', nodes.place_id
            ))
        FROM nodes
        INNER JOIN orders ON orders.id=nodes.order_id
        INNER JOIN places ON places.id=nodes.place_id
        WHERE orders.city_id=$1
        AND nodes.id NOT IN (
            SELECT node FROM route_nodes 
            INNER JOIN routes ON routes.id=route_nodes.route_id
            WHERE routes.isfull
        )
        GROUP BY 1, 2
        ORDER BY 1, 2
    ) AS sub
    GROUP BY 1`

    return await Database.incubate(query, { params: [cityId] });
}

const centroid = async (placeIds) => {

    const query = `
    SELECT ST_Centroid(ST_Collect(geom)) AS centroid
    FROM places
    WHERE id IN (${placeIds.join(',')});`

    const result = await Database.incubate(query);
    return result && result[0].centroid;
}

const furthestPlace = async (centerGeom, placeIds) => {

    const query = `
    SELECT id
    FROM places
    WHERE id IN (${placeIds.join(',')})
    ORDER BY ST_Distance(geom, '${centerGeom}') DESC;`

    const result = await Database.incubate(query);
    return result && result[0].id;
}

const nextPlaceToVisit = async (currentPlaceId, placeIdsToVisit, biasCenterGeom, { dirW, disW }) => {
    const query = `
    WITH points AS (
        SELECT id, geom FROM places WHERE id IN (${placeIdsToVisit.join(',')})
    ), currentPoint AS (
         SELECT geom FROM places WHERE id=${currentPlaceId}
    ), collection AS (
      SELECT max(ST_Distance(currentPoint.geom, points.geom)) AS max_distance
      FROM points
      INNER JOIN currentPoint ON true
    )
    SELECT
        id,
        (1 - abs(degrees(ST_Azimuth(currentPoint.geom, points.geom)) -
        degrees(ST_Azimuth(currentPoint.geom, '${biasCenterGeom}'))) / 360) * ${dirW} +
        (ST_Distance(currentPoint.geom, points.geom) / collection.max_distance) * ${disW}
    FROM points
    INNER JOIN collection ON true
    INNER JOIN currentPoint ON true
    ORDER BY 2;`

    // const query = `
    // WITH points AS (
    //     SELECT id, geom FROM places WHERE id IN (${placeIdsToVisit.join(',')})
    // ), currentPoint AS (
    //      SELECT geom FROM places WHERE id=${currentPlaceId}
    // )
    // SELECT
    //        id,
    //       ST_Distance(currentPoint.geom, points.geom) as thing
    // FROM points
    // INNER JOIN currentPoint ON true
    // ORDER BY thing;`

    const result = await Database.incubate(query);
    return result && result[0].id;
}

const googleMatrix = async (startPlaceId, endPlaceId) => {
    const res = await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=place_id:${startPlaceId}&destinations=place_id:${endPlaceId}&key=${GOOGLE_API_KEY}`);

    if (res.status === 200 && res.data.status === 'OK' && res.data.rows && res.data.rows.length > 0) {
        const { status, distance, duration } = res.data.rows[0].elements[0];

        if (status !== 'OK') return false;

        return {
            distance: distance.value,
            duration: duration.value
        }
    }

    return false;
}