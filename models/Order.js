const { builder, TABLES, incubate } = require('../helpers/Database');
const { Log } = require('../helpers/Logger'), logger = new Log('Order');

const clientOrders = async (clientId, cityId, active) => {

    const query = `
   SELECT	 
        orders.id, (sts.array_agg)[1] AS status,
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
        WHERE os.is_active=$3
        GROUP BY 1
    ) AS sts ON sts.order_id=orders.id
    WHERE orders.client_id=$1 AND orders.city_id=$2;`

    return await incubate(query, { params: [clientId, cityId, active], rowCount: -1 });
}

const placeOrder = async (clientId, cityId, pickup, dropoff, statusId = 1) => {
    try {
        const obj = { city_id: cityId, client_id: clientId }

        const places = await builder().table(TABLES.places).select('id').whereIn('id', [pickup.placeId, dropoff.placeId]);

        if (places.length !== 2) {
            logger.error(`Non existing place ids`);
            return false;
        }

        const order = await builder().table(TABLES.orders).insert(obj).returning('id');

        const orderId = order[0];

        const pickupObj = { order_id: orderId, action_id: 1, place_id: pickup.placeId, note: pickup.note }

        await builder().table(TABLES.nodes).insert(pickupObj);

        const dropoffObj = { order_id: orderId, action_id: 2, place_id: dropoff.placeId, note: dropoff.note, customer_name: dropoff.customer_name, customer_phone: dropoff.customer_phone }

        await builder().table(TABLES.nodes).insert(dropoffObj);

        await builder().table(TABLES.order_status_log).insert({ order_id: orderId, status_id: statusId });

        return orderId;
    } catch (error) {
        console.error(error);
        logger.error(`Order.placeOrder(), ${error.message}`);
        return false;
    }
}

const deleteOrderById = function (clientId, orderId) {
    return new Promise(async (resolve) => {

        try {
            const clientOrder = await builder().table(TABLES.orders).where({ id: orderId, client_id: clientId }).select('id');

            if (!clientOrder || clientOrder.length === 0) return resolve(false);

            const result = await builder().table(TABLES.orders).where({ id: orderId, client_id: clientId }).del();

            if (!result) return resolve(false);

            return resolve(true);

        } catch (error) {
            console.error(error);
            logger.error(`Order.deleteOrderById(), ${error.message}`);
            resolve(false);
        }
    });
}

const updateOrderStatusById = function (clientId, orderId, statusId) {
    return new Promise(async (resolve) => {

        try {
            const clientOrder = await builder().table(TABLES.orders).where({ id: orderId, client_id: clientId }).select('id');

            if (!clientOrder || clientOrder.length === 0) return resolve(false);

            const result = await builder().table(TABLES.order_status_log).insert({ order_id: orderId, status_id: statusId });

            if (!result) return resolve(false);

            return resolve(true);

        } catch (error) {
            console.error(error);
            logger.error(`Order.updateOrderStatusById(), ${error.message}`);
            resolve(false);
        }
    });
}

module.exports = { clientOrders, placeOrder, deleteOrderById, updateOrderStatusById }