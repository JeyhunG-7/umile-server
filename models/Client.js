const { builder, TABLES, incubate, knexPostgis } = require("./../helpers/Database");


exports.addClientAsync = function (email, first_name, last_name, company_name, phone, pwd_hash) {
    return new Promise((resolve, reject) => {
        builder()
            .table(TABLES.clients)
            .insert({ email: email, first_name: first_name, last_name: last_name, company_name: company_name, phone: phone, pwd_hash: pwd_hash })
            .then(resolve)
            .catch(reject);
    });
}

exports.findClientByEmail = function (email) {
    return new Promise((resolve, reject) => {
        builder()
            .select('*')
            .from(TABLES.clients)
            .where({ email: email })
            .then(resolve)
            .catch(reject);
    });
}

exports.updatePasswordForClientAsync = function (email, pwd_hash) {
    return new Promise((resolve, reject) => {
        builder()
            .table(TABLES.clients)
            .where({ email: email })
            .update({ pwd_hash: pwd_hash })
            .then(resolve)
            .catch(reject);
    });
}

exports.getHome = clientId => {

    return new Promise(async (resolve, reject) => {

        try {
            const home = await builder().table(TABLES.clients).where('id', clientId).select('home_place_id');

            const homePlaceId = home[0].home_place_id;
            if (!homePlaceId) return resolve(null);

            const place = await builder().table(TABLES.places).where('id', homePlaceId).select('address', 'id', knexPostgis.asGeoJSON('geom'));
            if (place.length === 0) return resolve(null);

            let coords = JSON.parse(place[0].geom).coordinates;

            let p = {
                id: place[0].id,
                address: place[0].address,
                lat: coords[1],
                lng: coords[0]
            }
            return resolve(p);
        } catch (error) {
            reject(error);
        }
    });
}

exports.setHome = function (clientId, placeId) {
    return new Promise((resolve, reject) => {
        builder()
            .table(TABLES.clients)
            .where('id', clientId)
            .update({ home_place_id: placeId })
            .then(resolve)
            .catch(reject);
    });
}

exports.getClientInformation = function (clientId) {
    return new Promise(async (resolve, reject) => {

        const query = `
        SELECT 
            clients.email, clients.first_name, clients.last_name, 
            clients.phone, clients.company_name AS company, COALESCE(sub.balance, 0::money) AS balance
        FROM clients
        LEFT JOIN (
            SELECT dor.client_id, SUM(dor.count * tariffs.cost)::float8::numeric::money AS balance 
            FROM (
                SELECT orders.client_id, od.day, count(*)
                FROM (
                    SELECT order_id, extract(day from osl.timestamp) AS "day",
                        (array_agg(os.id ORDER BY osl.timestamp DESC))[1] AS status
                    FROM order_status_log osl
                    INNER JOIN order_status os ON os.id=osl.status_id
                    WHERE extract(month from osl.timestamp) = extract(month from now()) 
                    AND extract(year from osl.timestamp) = extract(year from now())
                    GROUP BY 1, 2
                ) AS od
                INNER JOIN orders ON orders.id=od.order_id
                WHERE od.status=5
                GROUP BY 1, 2
            ) AS dor
            INNER JOIN tariffs ON (dor.count >= tariffs.range_min AND dor.count <= tariffs.range_max)
            GROUP BY 1
        ) AS sub ON sub.client_id=clients.id
        WHERE clients.id=$1`;

        const result = await incubate(query, { params: [clientId] });
        if (!result || result.length === 0) return reject();

        resolve(result[0]);
    });
}