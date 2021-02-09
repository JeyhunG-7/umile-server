const { app } = require('../../../app');
const request = require('supertest');
const http = require('http');
const Order = require('../../../models/Order');
const { builder, TABLES } = require('../../../helpers/Database');

describe('Orders API', () => {
    let server, auth_token, orderIds = [], placeId1, placeId2;

    beforeAll(async done => {
        // insert client
        const clientResult = await builder()
            .table(TABLES.clients)
            .insert({
                email: 'orders_client@email.com',
                first_name: 'Fname',
                last_name: 'Lname',
                phone: '4031111111',
                company_name: 'XYZ Company',
                pwd_hash: '$2b$10$2U3Dxk5f.UNffLl9WdTlBeR4vHPiSWamqiNqQs8bvmF8/VnHDhEeS' //test123
            })
            .returning('id');

        const placeResult1 = await builder()
            .table(TABLES.places)
            .insert({
                provider_id: 'order_test_1',
                address: '123 street bla',
                geom: `0101000000462575029A845CC0CB10C7BAB8854940`
            })
            .returning('id');

        const placeResult2 = await builder()
            .table(TABLES.places)
            .insert({
                provider_id: 'order_test_2',
                address: '125 street bla',
                geom: `0101000000006F8104C5C351C012A5BDC1172E4540`
            })
            .returning('id');

        const clientId = clientResult[0];
        placeId1 = placeResult1[0];
        placeId2 = placeResult2[0];

        const orderId1 = await Order.placeOrder(clientId, 1, { note: 'some note for pikcup', placeId: placeId1 }, { note: 'some note for dropoff', placeId: placeId2 });
        const orderId2 = await Order.placeOrder(clientId, 1, { note: 'some note for pikcup', placeId: placeId2 }, { note: 'some note for dropoff', placeId: placeId1 }, 5);

        orderIds.push(orderId1);
        orderIds.push(orderId2);

        server = http.createServer(app);

        server.listen(async () => {
            const loginResponse = await request(server)
                .post("/api/clients/login")
                .type('form')
                .send({
                    username: 'orders_client@email.com',
                    password: 'test123'
                })
                .set('Accept', 'application\\json');

            expect(loginResponse.status).toEqual(200);
            expect(loginResponse.body).toHaveProperty('success', true);
            expect(loginResponse.body).toHaveProperty('data');

            auth_token = loginResponse.body.data;

            done();
        })
    })

    afterAll(async done => {

        await builder()
            .table(TABLES.clients)
            .where('email', 'client@email.com')
            .delete();

        await builder()
            .table(TABLES.orders)
            .whereIn('id', orderIds)
            .delete();

        await builder()
            .table(TABLES.places)
            .whereIn('provider_id', ['order_test_1', 'order_test_2'])
            .delete();

        server.close(done);
    })

    test('GET orders/list - Missing auth token', async done => {

        const response = await request(server)
            .get("/api/orders/list")
            .query({ cityId: 1, active: true });

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'Invalid email or password');
        done();
    });

    test('GET orders/list - Success 1 active order', async done => {

        const response = await request(server)
            .get("/api/orders/list")
            .query({ cityId: 1, active: true })
            .auth(auth_token, { type: 'bearer' });

        expect(response.status).toEqual(200)
        expect(response.body).toHaveProperty('success', true)
        expect(response.body).toHaveProperty('data')
        expect(response.body.data).toHaveLength(1)
        done();
    });

    test('GET orders/list - Success 1 history order', async done => {

        const response = await request(server)
            .get("/api/orders/list")
            .query({ cityId: 1, active: false })
            .auth(auth_token, { type: 'bearer' });

        expect(response.status).toEqual(200)
        expect(response.body).toHaveProperty('success', true)
        expect(response.body).toHaveProperty('data')
        expect(response.body.data).toHaveLength(1)
        done();
    });

    test('POST orders/place - Success!', async done => {

        const response = await request(server)
            .post("/api/orders/place")
            .auth(auth_token, { type: 'bearer' })
            .send({
                cityId: 1,
                pickup: { note: 'some note for pikcup', placeId: placeId1 },
                dropoff: { note: 'some note for dropoff', placeId: placeId2, customer_name: 'John Doe', customer_phone: '4031111111' },
            })

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', true);
        expect(typeof response.body.data).toBe('number');

        orderIds.push(response.body.data);

        done();
    });

    test.each([
        ['Missing drop off info', {
            cityId: 1,
            pickup: { note: 'some note for pikcup', placeId: placeId1 },
        }],
        ['Missing Pick up info', {
            cityId: 1,
            dropoff: { note: 'some note for dropoff', placeId: placeId2, customer_name: 'John Doe', customer_phone: '4031111111' }
        }],
        ['Missing customer info', {
            cityId: 1,
            pickup: { note: 'some note for pikcup', placeId: placeId1 },
            dropoff: { note: 'some note for dropoff', placeId: placeId2, customer_name: 'John Doe' }
        }],
        ['Missing cityId', {
            pickup: { note: 'some note for pikcup', placeId: placeId1 },
            dropoff: { note: 'some note for dropoff', placeId: placeId2, customer_name: 'John Doe', customer_phone: '4031111111' }
        }]
    ])
        ('POST orders/place - %s', async (textName, data, done) => {

            const response = await request(server)
                .post("/api/orders/place")
                .auth(auth_token, { type: 'bearer' })
                .send(data)

            expect(response.status).toEqual(200);
            expect(response.body).toHaveProperty('success', false);
            expect(response.body.message).toBe("Request is missing params!");

            done();
        });

    test('GET orders/place - Missing auth token', async done => {

        const response = await request(server)
            .post("/api/orders/place")
            .send({
                cityId: 1,
                pickup: { note: 'some note for pikcup', placeId: placeId1 },
                dropoff: { note: 'some note for dropoff', placeId: placeId2 },
            })

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'Invalid email or password');
        done();
    });

    test('POST orders/place - Non existant place id', async done => {

        const response = await request(server)
            .post("/api/orders/place")
            .auth(auth_token, { type: 'bearer' })
            .send({
                cityId: 1,
                pickup: { note: 'some note for pikcup', placeId: placeId1 },
                dropoff: { note: 'some note for dropoff', placeId: 99000 },
            })

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', false);
        done();
    });

    test('POST orders/delete - Missing params', async done => {

        const response = await request(server)
            .post("/api/orders/delete")
            .auth(auth_token, { type: 'bearer' })

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body.message).toBe("Request is missing params!");
        done();
    });

    test('POST orders/delete - Missing auth', async done => {

        const response = await request(server)
            .post("/api/orders/delete")

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body.message).toBe("Invalid email or password");
        done();
    });

    test('POST orders/delete - Wrong order id', async done => {

        const response = await request(server)
            .post("/api/orders/delete")
            .auth(auth_token, { type: 'bearer' })
            .send({ orderId: 100001 })

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body.message).toBe("Error while deleting order");

        done();
    });

    test('POST orders/delete - Success', async done => {

        const response = await request(server)
            .post("/api/orders/delete")
            .auth(auth_token, { type: 'bearer' })
            .send({ orderId: orderIds[0] })

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', true);

        if (response.body.success) orderIds.shift();

        done();
    });

    test('POST orders/status - Missing params', async done => {

        const response = await request(server)
            .post("/api/orders/status")
            .auth(auth_token, { type: 'bearer' })

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body.message).toBe("Request is missing params!");

        done();
    });

    test('POST orders/status - Missing auth params', async done => {

        const response = await request(server)
            .post("/api/orders/status")

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body.message).toBe("Invalid email or password");

        done();
    });

    test('POST orders/status - Wrong order id', async done => {

        const response = await request(server)
            .post("/api/orders/status")
            .auth(auth_token, { type: 'bearer' })
            .send({ orderId: 100001, submit: true })

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body.message).toBe("Error while updating order status");

        done();
    });

    test('POST orders/status - Success submit', async done => {

        const response = await request(server)
            .post("/api/orders/status")
            .auth(auth_token, { type: 'bearer' })
            .send({ orderId: orderIds[0], submit: true })

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', true);

        done();
    });

    test('POST orders/status - Success unsubmit', async done => {

        const response = await request(server)
            .post("/api/orders/status")
            .auth(auth_token, { type: 'bearer' })
            .send({ orderId: orderIds[0], submit: false })

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', true);

        done();
    });
});

