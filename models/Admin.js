const { builder, TABLES, incubate } = require("./../helpers/Database");


exports.findAdminByEmail = function (email) {
    return new Promise((resolve, reject) => {
        builder()
            .select('*')
            .from(TABLES.admins)
            .where({ email: email })
            .then(resolve)
            .catch(reject);
    });
}

exports.allOrders = async (cityId, active) => {

    const query = `
    SELECT	 
        orders.id, orders.received_date, (sts.array_agg)[1] AS status,
        json_build_object(
            'name', CONCAT(clients.first_name, ' ', clients.last_name),
            'id', clients.id,
            'phone', clients.phone,
            'company', clients.company_name,
            'email', clients.email,
            'homePlaceId', clients.home_place_id
        ) AS client,
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
                'customerName', nodes.customer_name,
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
                'id', os.id,
                'value', os.name,
                'timestamp', osl.timestamp,
                'is_active', os.is_active
            ) ORDER BY osl.timestamp DESC)
        FROM order_status_log osl
        INNER JOIN order_status os ON os.id=osl.status_id
        GROUP BY 1
    ) AS sts ON sts.order_id=orders.id
    INNER JOIN clients ON clients.id=orders.client_id
    WHERE orders.city_id=$1 AND bool((sts.array_agg)[1]->>'is_active')=$2;`

    return await incubate(query, { params: [cityId, active], rowCount: -1 });
}

exports.updateOrderStatus = function (orderId, statusId) {
    return new Promise((resolve, reject) => {
        builder()
            .insert({ order_id: orderId, status_id: statusId })
            .table(TABLES.order_status_log)
            .then(resolve)
            .catch(reject);
    });
}

exports.getAllStatuses = function () {
    return new Promise((resolve, reject) => {
        builder()
            .select('*')
            .table(TABLES.order_status)
            .then(resolve)
            .catch(reject);
    });
}