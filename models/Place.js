const { builder, TABLES, incubate } = require('../helpers/Database');

const search = async (term) => {
    try {
        return await builder().table(TABLES.places)
            .whereRaw("lower(address) LIKE lower(? || '%')", [term])
            .select('id', 'address').limit(5);

    } catch (error) {
        console.error(error.message);
        return false;
    }
}

const save = async (providerId, address, type, lat, lng ) => {
    try {
        const placeIds = await builder().table(TABLES.places)
            .where("provider_id", providerId)
            .select('id');

        if (placeIds.length > 0) return false;

        const query = `
            INSERT INTO places(address, type, provider_id, geom)
            VALUES ('${address}', '${type}', '${providerId}', 
            POINT(${lng}, ${lat})::geometry)
            RETURNING id;`

        const result = await incubate(query);
        return result && result[0].id;
    } catch (error) {
        console.error(error.message);
        return false;
    }
}

module.exports = { search, save }