jest.mock('./../../../helpers/SendGrid');

// Setup express for testing
const { app } = require('./../../../app');
const request = require('supertest');
const http = require('http');

const SendGrid = require('./../../../helpers/SendGrid');

const Order = require('../../../models/Order');
const { builder, TABLES } = require('./../../../helpers/Database');

describe('Admin API', () => {

    let server, placeId1, placeId2, orderId, auth_token, client_auth_token;

    beforeAll(async (done) => {
        // insert admin
        await builder()
            .table(TABLES.admins)
            .insert({
                email: 'admin@email.com',
                first_name: 'Fname',
                last_name: 'Lname',
                pwd_hash: '$2b$10$2U3Dxk5f.UNffLl9WdTlBeR4vHPiSWamqiNqQs8bvmF8/VnHDhEeS' //test123
            });

        // insert client
        const clientResult = await builder()
            .table(TABLES.clients)
            .insert({
                email: 'client@email.com',
                first_name: 'Fname',
                last_name: 'Lname',
                phone: '4031111111',
                company_name: 'XYZ Company',
                pwd_hash: '$2b$10$2U3Dxk5f.UNffLl9WdTlBeR4vHPiSWamqiNqQs8bvmF8/VnHDhEeS' //test123
            })
            .returning('id');

        // Insert order and related stuff
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

        orderId = await Order.placeOrder(clientId, 1, { note: 'some note for pikcup', placeId: placeId1 }, { note: 'some note for dropoff', placeId: placeId2 });

        server = http.createServer(app);
        server.listen(async () => {

            const loginResponse = await request(server)
                .post("/api/admin/login")
                .send({
                    username: 'admin@email.com',
                    password: 'test123'
                });

            expect(loginResponse.status).toEqual(200);
            expect(loginResponse.body).toHaveProperty('success', true);
            expect(loginResponse.body).toHaveProperty('data');

            auth_token = loginResponse.body.data;

            const clientLoginResponse = await request(server)
                .post("/api/clients/login")
                .send({
                    username: 'client@email.com',
                    password: 'test123'
                });

            expect(clientLoginResponse.status).toEqual(200);
            expect(clientLoginResponse.body).toHaveProperty('success', true);
            expect(clientLoginResponse.body).toHaveProperty('data');

            client_auth_token = clientLoginResponse.body.data;

            done();
        })
    })

    afterAll(async (done) => {
        // remove admin
        await builder()
            .table(TABLES.admins)
            .where({ email: 'admin@email.com' })
            .delete();

        // remove client
        await builder()
            .table(TABLES.clients)
            .where({ email: 'client@email.com' })
            .delete();

        // Delete placed order and places used for order
        await builder()
            .table(TABLES.places)
            .whereIn('id', [placeId1, placeId2])
            .delete();

        await builder()
            .table(TABLES.orders)
            .where('id', orderId)
            .delete();

        server.close(done);
    })

    afterEach(() => {
        jest.clearAllMocks();
    })

    test('POST /login - Success', async (done) => {
        var response = await request(server)
            .post("/api/admin/login")
            .type('form')
            .send({
                username: 'admin@email.com',
                password: 'test123'
            })
            .set('Accept', 'application\\json');
        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data.length > 0).toBeTruthy();
        done();
    });

    test.each([
        ['Missing email', { password: 'test123' }],
        ['Missing password', { username: 'admin@email.com' }],
        ['Invalid password', { username: 'admin@email.com', password: 'notValid' }],
        ['Invalid email', { username: 'notValidadmin@email.com', password: 'test123' }]
    ])
        ('POST /login - %s', async (textName, data, done) => {
            var response = await request(server)
                .post("/api/admin/login")
                .type('form')
                .send(data)
                .set('Accept', 'application\\json');
            expect(response.status).toEqual(200);
            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('message', 'Invalid email or password');
            done();
        });

    test('POST /login - Should fail when using client JWT instead of admin', async (done) => {
        var loginResponse = await request(server)
            .post("/api/clients/login")
            .type('form')
            .send({
                username: 'client@email.com',
                password: 'test123'
            })
            .set('Accept', 'application\\json');
        expect(loginResponse.status).toEqual(200);
        expect(loginResponse.body).toHaveProperty('success', true);
        expect(loginResponse.body).toHaveProperty('data');

        var auth_token = loginResponse.body.data;

        var response = await request(server)
            .post("/api/admin/logout")
            .auth(auth_token, { type: 'bearer' });

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'Invalid email or password');

        done();
    });

    test('POST /logout - Success', async (done) => {
        var loginResponse = await request(server)
            .post("/api/admin/login")
            .type('form')
            .send({
                username: 'admin@email.com',
                password: 'test123'
            })
            .set('Accept', 'application\\json');
        expect(loginResponse.status).toEqual(200);
        expect(loginResponse.body).toHaveProperty('success', true);
        expect(loginResponse.body).toHaveProperty('data');

        var auth_token = loginResponse.body.data;

        var response = await request(server)
            .post("/api/admin/logout")
            .auth(auth_token, { type: 'bearer' });

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', true);
        done();
    });

    test('POST /logout - Invalid Token', async (done) => {
        var response = await request(server)
            .post("/api/admin/logout")
            .auth('afadfdsaflsfjlksdajflks', { type: 'bearer' });

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'Invalid email or password');
        done();
    });

    test('POST /logout - No Token', async (done) => {
        var response = await request(server)
            .post("/api/admin/logout");

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'Invalid email or password');
        done();
    });

    test('POST /createinvitation - Failure', async (done) => {
        var loginResponse = await request(server)
            .post("/api/admin/login")
            .type('form')
            .send({
                username: 'admin@email.com',
                password: 'test123'
            })
            .set('Accept', 'application\\json');
        expect(loginResponse.status).toEqual(200);
        expect(loginResponse.body).toHaveProperty('success', true);
        expect(loginResponse.body).toHaveProperty('data');

        var auth_token = loginResponse.body.data;

        jest.spyOn(SendGrid, 'sendSignupEmail')
            .mockImplementation((email, first_name, link) => {
                return false;
            });

        var response = await request(server)
            .post("/api/admin/createinvitation")
            .type('form')
            .send({ email: 'client@email.com', "first_name": "Client" })
            .set('Accept', 'application\\json')
            .auth(auth_token, { type: 'bearer' });

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'Error while creating signup email');

        done();
    });

    test('POST /createinvitation - Success', async (done) => {
        var loginResponse = await request(server)
            .post("/api/admin/login")
            .type('form')
            .send({
                username: 'admin@email.com',
                password: 'test123'
            })
            .set('Accept', 'application\\json');
        expect(loginResponse.status).toEqual(200);
        expect(loginResponse.body).toHaveProperty('success', true);
        expect(loginResponse.body).toHaveProperty('data');

        var auth_token = loginResponse.body.data;

        var sendGridEmail = '';
        var sendGridFirstName = '';
        var sendGridLink = '';
        jest.spyOn(SendGrid, 'sendSignupEmail')
            .mockImplementation((email, first_name, link) => {
                sendGridEmail = email;
                sendGridFirstName = first_name;
                sendGridLink = link;
                return true
            });

        var response = await request(server)
            .post("/api/admin/createinvitation")
            .type('form')
            .send({ email: 'client@email.com', "first_name": "Client" })
            .set('Accept', 'application\\json')
            .auth(auth_token, { type: 'bearer' });

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', true);

        expect(sendGridEmail).toEqual('client@email.com');
        expect(sendGridFirstName).toEqual('Client');
        expect(sendGridLink).toMatch(/http.*\/signup\/.*\..*\.*/gm);
        done();
    });

    test('POST /createinvitation - No Authentication', async (done) => {

        var response = await request(server)
            .post("/api/admin/createinvitation")
            .type('form')
            .send({ email: 'client@email.com', "first_name": "Client" })
            .set('Accept', 'application\\json');;

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'Invalid email or password');
        done();
    });

    test.each([
        ['Missing email', { first_name: 'Client' }],
        ['Missing first_name', { email: 'admin@email.com ' }],
        ['Not a valid email', { email: 'email.com ' }]
    ])
        ('POST /createinvitation - %s', async (testName, data, done) => {
            var loginResponse = await request(server)
                .post("/api/admin/login")
                .type('form')
                .send({
                    username: 'admin@email.com',
                    password: 'test123'
                })
                .set('Accept', 'application\\json');
            expect(loginResponse.status).toEqual(200);
            expect(loginResponse.body).toHaveProperty('success', true);
            expect(loginResponse.body).toHaveProperty('data');

            var auth_token = loginResponse.body.data;

            var response = await request(server)
                .post("/api/admin/createinvitation")
                .type('form')
                .send(data)
                .set('Accept', 'application\\json')
                .auth(auth_token, { type: 'bearer' });

            expect(response.status).toEqual(200);
            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('message', 'Missing params!');
            expect(SendGrid.sendSignupEmail).not.toHaveBeenCalled();
            done();
        });


    /** TODO: WIP **/

    test('GET /orders/list - Success (Active orders | 1)', async (done) => {

        const response = await request(server)
            .get("/api/admin/orders/list")
            .auth(auth_token, { type: 'bearer' })
            .query({ cityId: 1, active: true });

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveLength(1);
        done();
    });

    test('GET /orders/statuses - Success', async (done) => {

        const response = await request(server)
            .get("/api/admin/orders/statuses")
            .auth(auth_token, { type: 'bearer' })
            .query();

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data.length > 0).toBeTruthy();
        done();
    });

    test('GET /orders/changeStatus - Success', async (done) => {

        const response = await request(server)
            .post("/api/admin/orders/changeStatus")
            .auth(auth_token, { type: 'bearer' })
            .send({ orderId, statusId: 5 }); //delivered

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', true);
        done();
    });

    test('GET /orders/list - Success (Active orders | 0)', async (done) => {

        const response = await request(server)
            .get("/api/admin/orders/list")
            .auth(auth_token, { type: 'bearer' })
            .query({ cityId: 1, active: true });

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveLength(0);
        done();
    });

    test('GET /orders/list - Success (Orders history)', async (done) => {

        const response = await request(server)
            .get("/api/admin/orders/list")
            .auth(auth_token, { type: 'bearer' })
            .query({ cityId: 1, active: false });

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveLength(1);
        done();
    });

    test.each([
        ['/orders/list', { path: '/api/admin/orders/list', type: 'GET' }],
        ['/orders/changeStatus', { path: '/api/admin/orders/changeStatus', type: 'POST' }]
    ])
        ('Missing params - %s', async (testName, data, done) => {
            let response;

            if (data.type === 'GET') {
                response = await request(server).get(data.path).auth(auth_token, { type: 'bearer' });
            } else if (data.type === 'POST') {
                response = await request(server).post(data.path).auth(auth_token, { type: 'bearer' });
            }

            expect(response.status).toEqual(200);
            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('message', 'Missing params!');
            done();
        });

    test.each([
        ['/orders/list', { path: '/api/admin/orders/list', type: 'GET' }],
        ['/orders/changeStatus', { path: '/api/admin/orders/changeStatus', type: 'POST' }],
        ['/orders/statuses', { path: '/api/admin/orders/statuses', type: 'GET' }]
    ])
        ('Non admin auth - %s', async (testName, data, done) => {
            let response;

            if (data.type === 'GET') {
                response = await request(server).get(data.path).auth(client_auth_token, { type: 'bearer' });
            } else if (data.type === 'POST') {
                response = await request(server).post(data.path).auth(client_auth_token, { type: 'bearer' });
            }

            expect(response.status).toEqual(200);
            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('message', 'Invalid email or password');
            done();
        });

    test.each([
        ['/orders/list', { path: '/api/admin/orders/list', type: 'GET' }],
        ['/orders/changeStatus', { path: '/api/admin/orders/changeStatus', type: 'POST' }],
        ['/orders/statuses', { path: '/api/admin/orders/statuses', type: 'GET' }]
    ])
        ('Missing auth - %s', async (testName, data, done) => {
            let response;

            if (data.type === 'GET') {
                response = await request(server).get(data.path);
            } else if (data.type === 'POST') {
                response = await request(server).post(data.path);
            }

            expect(response.status).toEqual(200);
            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('message', 'Invalid email or password');
            done();
        });
});

