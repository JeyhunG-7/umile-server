const { builder, TABLES, incubate } = require('../helpers/Database');
const { Log } = require('../helpers/Logger'), logger = new Log('Order');

const clientOrders = async (clientId, cityId) => {

    const query = `
   SELECT	 
        orders.id, sts.array_agg AS "statusLog",
        (pickups.array_agg)[1] AS pickup,
        (dropoffs.array_agg)[1] AS dropoff
    FROM orders
    INNER JOIN (
        SELECT nodes.order_id, array_agg(json_build_object(
                'address', places.address,
                'note', nodes.note,
                'placeId', places.id
            ))
        FROM nodes
        INNER JOIN places ON nodes.place_id=places.id
        WHERE nodes.action_id=1
        GROUP BY 1
    ) AS pickups
    ON pickups.order_id=orders.id
    INNER JOIN (
        SELECT nodes.order_id, array_agg(json_build_object(
                'address', places.address,
                'note', nodes.note,
                'placeId', places.id
            ))
        FROM nodes
        INNER JOIN places ON nodes.place_id=places.id
        WHERE nodes.action_id=2
        GROUP BY 1
    ) AS dropoffs
    ON dropoffs.order_id=orders.id
    INNER JOIN (
        SELECT order_id, array_agg(json_build_object(
                'timestamp', osl.timestamp,
                'value', os.name,
                'id', os.id
            ) ORDER BY osl.timestamp DESC)
        FROM order_status_log osl
        INNER JOIN order_status os ON os.id=osl.status_id
        GROUP BY 1
    ) AS sts ON sts.order_id=orders.id
    WHERE orders.client_id=$1 AND orders.city_id=$2;`

    return await incubate(query, { params: [clientId, cityId], rowCount: -1 });
}

const placeOrder = async (clientId, cityId, pickup, dropoff) => {
    try {
        const obj = { city_id: cityId, client_id: clientId }

        const order = await builder().table(TABLES.orders).insert(obj).returning('id');

        const orderId = order[0];

        const pickupObj = { order_id: orderId, action_id: 1, place_id: pickup.placeId, note: pickup.note }

        await builder().table(TABLES.nodes).insert(pickupObj);

        const dropoffObj = { order_id: orderId, action_id: 2, place_id: dropoff.placeId, note: dropoff.note }

        await builder().table(TABLES.nodes).insert(dropoffObj);

        await builder().table(TABLES.order_status_log).insert({ order_id: orderId, status_id: 1 });

        return orderId;
    } catch (error) {
        logger.error(`Order.placeOrder(), ${error.message}`);
        return false;
    }
}

module.exports = { clientOrders, placeOrder }