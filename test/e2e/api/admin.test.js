jest.mock('./../../../helpers/SendGrid');

// Setup express for testing
const { app } = require('./../../../app');
const request = require('supertest');
const http = require('http');

const SendGrid = require('./../../../helpers/SendGrid');

const { builder, TABLES } = require('./../../../helpers/Database');

describe('Admin API', () => {

    var server;

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

        server = http.createServer(app);
        server.listen(done)
    })

    afterAll(async (done) => {
        // remove admin
        await builder()
            .table(TABLES.admins)
            .where({email: 'admin@email.com'})
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
            ['Missing email', {password: 'test123'}],
            ['Missing password', {username: 'admin@email.com'}],
            ['Invalid password', {username: 'admin@email.com', password: 'notValid'}],
            ['Invalid email', {username: 'notValidadmin@email.com', password: 'test123'}]
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
            .auth(auth_token, {type: 'bearer'});

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', true);
        done();
    });

    test('POST /logout - Invalid Token', async (done) => {
        var response = await request(server)
            .post("/api/admin/logout")
            .auth('afadfdsaflsfjlksdajflks', {type: 'bearer'});

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
            .send({email: 'client@email.com', "first_name": "Client"})
            .set('Accept', 'application\\json')
            .auth(auth_token, {type: 'bearer'});

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
            .send({email: 'client@email.com', "first_name": "Client"})
            .set('Accept', 'application\\json')
            .auth(auth_token, {type: 'bearer'});

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
            .send({email: 'client@email.com', "first_name": "Client"})
            .set('Accept', 'application\\json');;

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'Invalid email or password');
        done();
    });

    test.each([
        ['Missing email', {first_name: 'Client'}],
        ['Missing first_name', {email: 'admin@email.com '}],
        ['Not a valid email', {email: 'email.com '}]
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
            .auth(auth_token, {type: 'bearer'});

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'Missing params!');
        expect(SendGrid.sendSignupEmail).not.toHaveBeenCalled();
        done();
    });
});

