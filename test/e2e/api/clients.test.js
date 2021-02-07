jest.mock('./../../../helpers/SendGrid');

// Setup express for testing
const { app } = require('./../../../app');
const request = require('supertest');
const http = require('http');

const SendGrid = require('./../../../helpers/SendGrid');

const Order = require('../../../models/Order')

const { builder, TABLES } = require('./../../../helpers/Database');

describe('Clients API', () => {
    let server, orderId, placeId1, placeId2;

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

        // insert clients
        await builder()
            .table(TABLES.clients)
            .insert({
                email: 'client@email.com',
                first_name: 'Fname',
                last_name: 'Lname',
                phone: '4031111111',
                company_name: 'XYZ Company',
                pwd_hash: '$2b$10$2U3Dxk5f.UNffLl9WdTlBeR4vHPiSWamqiNqQs8bvmF8/VnHDhEeS' //test123
            });

        //this is also used for client info testing
        await builder()
            .table(TABLES.clients)
            .insert({
                email: 'client2@email.com',
                first_name: 'F',
                last_name: 'L',
                phone: '4031111111',
                company_name: 'XYZ Company',
                pwd_hash: '$2b$10$2U3Dxk5f.UNffLl9WdTlBeR4vHPiSWamqiNqQs8bvmF8/VnHDhEeS' //test123
            });

        const placeResult1 = await builder()
            .table(TABLES.places)
            .insert({
                provider_id: 'client_test_1',
                address: '125 street bla',
                geom: `0101000000006F8104C5C351C012A5BDC1172E4540`
            }).returning('id');

        const placeResult2 = await builder()
            .table(TABLES.places)
            .insert({
                provider_id: 'client_test_2',
                address: '125 avenue bla',
                geom: `0101000000006F8104C5C351C012A5BDC1172E4540`
            }).returning('id');

        placeId1 = placeResult1[0];
        placeId2 = placeResult2[0];

        //For client info balance testing
        orderId = await Order.placeOrder(2, 1, { note: 'some note for pikcup', placeId: placeId1 }, { note: 'some note for dropoff', placeId: placeId2 }, 5);

        server = http.createServer(app);
        server.listen(done)
    })

    afterAll(async (done) => {
        // remove client
        await builder()
            .table(TABLES.clients)
            .whereIn('email', ['client@email.com', 'client2@email.com'])
            .delete();

        // remove admin
        await builder()
            .table(TABLES.admins)
            .where({ email: 'admin@email.com' })
            .delete();

        //remove places
        await builder()
            .table(TABLES.places)
            .whereIn('provider_id', ['client_test_1', 'client_test_2'])
            .delete();

        //remove order
        await builder()
            .table(TABLES.orders)
            .where('id', orderId)
            .delete();

        server.close(done);
    })

    afterEach(() => {
        jest.resetAllMocks();
    })

    test('POST /login - Success', async (done) => {
        var response = await request(server)
            .post("/api/clients/login")
            .type('form')
            .send({
                username: 'client@email.com',
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
        ['Missing password', { username: 'client@email.com' }],
        ['Invalid password', { username: 'client@email.com', password: 'notValid' }],
        ['Invalid email', { username: 'admin@email.com', password: 'test123' }]
    ])
        ('POST /login - %s', async (textName, data, done) => {
            var response = await request(server)
                .post("/api/clients/login")
                .type('form')
                .send(data)
                .set('Accept', 'application\\json');
            expect(response.status).toEqual(200);
            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('message', 'Invalid email or password');
            done();
        });

    test('POST /login - Should fail when using admin JWT instead of client', async (done) => {
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
            .post("/api/clients/logout")
            .auth(auth_token, { type: 'bearer' });

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'Invalid email or password');

        done();
    });

    test('GET /login - Success', async (done) => {
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
            .get("/api/clients/login")
            .auth(auth_token, { type: 'bearer' });

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        done();
    });

    test('GET /login - Invalid Token', async (done) => {
        var response = await request(server)
            .get("/api/clients/login")
            .auth('afadfdsaflsfjlksdajflks', { type: 'bearer' });

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'Invalid email or password');
        done();
    });

    test('GET /login - No Token', async (done) => {
        var response = await request(server)
            .post("/api/clients/logout");

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'Invalid email or password');
        done();
    });

    test('POST /logout - Success', async (done) => {
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
            .post("/api/clients/logout")
            .auth(auth_token, { type: 'bearer' });

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', true);
        done();
    });

    test('POST /logout - Invalid Token', async (done) => {
        var response = await request(server)
            .post("/api/clients/logout")
            .auth('afadfdsaflsfjlksdajflks', { type: 'bearer' });

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'Invalid email or password');
        done();
    });

    test('POST /logout - No Token', async (done) => {
        var response = await request(server)
            .post("/api/clients/logout");

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'Invalid email or password');
        done();
    });

    test('POST /emailforgotpassword - Success', async (done) => {

        let sendGridEmail = '';
        let sendGridFirstName = '';
        let sendGridLink = '';
        jest.spyOn(SendGrid, 'sendResetPasswordEmail')
            .mockImplementationOnce((email, first_name, link) => {
                sendGridEmail = email;
                sendGridFirstName = first_name;
                sendGridLink = link;
                return true;
            });

        var response = await request(server)
            .post("/api/clients/emailforgotpassword")
            .type('form')
            .send({
                email: 'client@email.com'
            })
            .set('Accept', 'application\\json');

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data', 'Email will be sent to client@email.com if it is registered');
        expect(sendGridEmail).toEqual('client@email.com');
        expect(sendGridFirstName).toEqual('Fname Lname');
        expect(sendGridLink).toMatch(/http.*\/resetpassword\/.*\..*\.*/gm);
        done();
    });

    test('POST /emailforgotpassword - User not in db', async (done) => {

        let sendGridEmail = null;
        let sendGridFirstName = null;
        let sendGridLink = null;
        jest.spyOn(SendGrid, 'sendResetPasswordEmail')
            .mockImplementationOnce((email, first_name, link) => {
                sendGridEmail = email;
                sendGridFirstName = first_name;
                sendGridLink = link;
                return true;
            });

        var response = await request(server)
            .post("/api/clients/emailforgotpassword")
            .type('form')
            .send({
                email: 'notInDbClient@email.com'
            })
            .set('Accept', 'application\\json');

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data', 'Email will be sent to notInDbClient@email.com if it is registered');
        expect(sendGridEmail).toBeNull();
        expect(sendGridFirstName).toBeNull();
        expect(sendGridLink).toBeNull();
        done();
    });

    test('POST /emailforgotpassword - No params', async (done) => {

        let sendGridEmail = null;
        let sendGridFirstName = null;
        let sendGridLink = null;
        jest.spyOn(SendGrid, 'sendResetPasswordEmail')
            .mockImplementationOnce((email, first_name, link) => {
                sendGridEmail = email;
                sendGridFirstName = first_name;
                sendGridLink = link;
                return true;
            });

        var response = await request(server)
            .post("/api/clients/emailforgotpassword");

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'Request is missing params!');
        expect(sendGridEmail).toBeNull();
        expect(sendGridFirstName).toBeNull();
        expect(sendGridLink).toBeNull();
        done();
    });

    test('POST /emailforgotpassword - No proper first_name and/or last_name', async (done) => {
        let sendGridEmail = null;
        let sendGridFirstName = null;
        let sendGridLink = null;
        jest.spyOn(SendGrid, 'sendResetPasswordEmail')
            .mockImplementationOnce((email, first_name, link) => {
                sendGridEmail = email;
                sendGridFirstName = first_name;
                sendGridLink = link;
                return true;
            });

        var response = await request(server)
            .post("/api/clients/emailforgotpassword")
            .type('form')
            .send({
                email: 'client2@email.com'
            })
            .set('Accept', 'application\\json');

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data', 'Email will be sent to client2@email.com if it is registered');

        expect(sendGridEmail).toEqual('client2@email.com');
        expect(sendGridFirstName).toEqual('client2@email.com');
        expect(sendGridLink).toMatch(/http.*\/resetpassword\/.*\..*\.*/gm);
        done();
    });

    test('GET /home - Missing auth token', async done => {

        const response = await request(server)
            .get("/api/clients/home");

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'Invalid email or password');
        done();
    });

    test('GET /home - Success NULL before setting', async done => {
        const loginResponse = await request(server)
            .post("/api/clients/login")
            .send({
                username: 'client@email.com',
                password: 'test123'
            });

        expect(loginResponse.status).toEqual(200);
        expect(loginResponse.body).toHaveProperty('success', true);
        expect(loginResponse.body).toHaveProperty('data');

        const auth_token = loginResponse.body.data;

        const response = await request(server)
            .get("/api/clients/home")
            .auth(auth_token, { type: 'bearer' });

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toBeNull();
        done();
    });

    test('POST /home - Missing auth token', async done => {

        const response = await request(server)
            .post("/api/clients/home")
            .send({ placeId: placeId2 });

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'Invalid email or password');
        done();
    });

    test('POST /home - Success Set Home', async done => {
        const loginResponse = await request(server)
            .post("/api/clients/login")
            .send({
                username: 'client@email.com',
                password: 'test123'
            });

        expect(loginResponse.status).toEqual(200);
        expect(loginResponse.body).toHaveProperty('success', true);
        expect(loginResponse.body).toHaveProperty('data');

        const auth_token = loginResponse.body.data;

        const response = await request(server)
            .post("/api/clients/home")
            .auth(auth_token, { type: 'bearer' })
            .send({ placeId: placeId1 });

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        done();
    });

    test('GET /home - Success after setting', async done => {
        const loginResponse = await request(server)
            .post("/api/clients/login")
            .send({
                username: 'client@email.com',
                password: 'test123'
            });

        expect(loginResponse.status).toEqual(200);
        expect(loginResponse.body).toHaveProperty('success', true);
        expect(loginResponse.body).toHaveProperty('data');

        const auth_token = loginResponse.body.data;

        const response = await request(server)
            .get("/api/clients/home")
            .auth(auth_token, { type: 'bearer' });

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toStrictEqual({ "address": "125 street bla", "id": 1, "lat": 42.3601, "lng": -71.0589 });
        done();
    });

    test('GET /info - Missing auth token', async done => {

        const response = await request(server)
            .get("/api/clients/info");

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'Invalid email or password');
        done();
    });

    test('GET /info - Sucess with some balance', async done => {
        const loginResponse = await request(server)
            .post("/api/clients/login")
            .type('form')
            .send({
                username: 'client2@email.com',
                password: 'test123'
            })
            .set('Accept', 'application\\json');

        expect(loginResponse.status).toEqual(200);
        expect(loginResponse.body).toHaveProperty('success', true);
        expect(loginResponse.body).toHaveProperty('data');

        const auth_token = loginResponse.body.data;

        const response = await request(server)
            .get("/api/clients/info")
            .auth(auth_token, { type: 'bearer' });

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toStrictEqual({
            balance: '$9.99',
            company: 'XYZ Company',
            email: 'client2@email.com',
            first_name: 'F',
            last_name: 'L',
            phone: '4031111111'
        });

        done();
    });

    test('GET /info - Sucess with $0 balance', async done => {
        const loginResponse = await request(server)
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

        const auth_token = loginResponse.body.data;

        const response = await request(server)
            .get("/api/clients/info")
            .auth(auth_token, { type: 'bearer' });

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toStrictEqual({
            balance: '$0.00',
            company: 'XYZ Company',
            email: 'client@email.com',
            first_name: 'Fname',
            last_name: 'Lname',
            phone: '4031111111'
        });

        done();
    });

    test.todo('POST /validate - add scenarios');
    test.todo('POST /signup - add scenarios');
    test.todo('POST /forgotpassword - add scenarios');
});