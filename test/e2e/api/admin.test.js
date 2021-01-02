jest.setMock('./../../../helpers/SendGrid', {});
const ResponseBuilder = require('../../../helpers/ResponseBuilder');

// Setup global test framework
const { app } = require('./../../../app');
const request = require('supertest');
const http = require('http');

const { builder, TABLES } = require('./../../../helpers/Database');
const { default: each } = require('jest-each');

describe('Admin API', () => {

    var server;

    beforeAll(async (done) => {
        // insert admin
        await builder()
            .table(TABLES.admins)
            .insert({
                email: 'email@email.com',
                first_name: 'Fname',
                last_name: 'Lname',
                pwd_hash: '$2b$10$2U3Dxk5f.UNffLl9WdTlBeR4vHPiSWamqiNqQs8bvmF8/VnHDhEeS' //test123
            });

        server = http.createServer(app);
        server.listen(done)
    })

    afterAll(async (done) => {
        await builder()
            .table(TABLES.admins)
            .where({email: 'email@email.com'})
            .delete();


        server.close(done);
    })

    test('POST /login - success', async (done) => {
        var response = await request(server)
            .post("/api/admin/login")
            .type('form')
            .send({
                username: 'email@email.com',
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
            ['Missing password', {username: 'email@email.com'}],
            ['Invalid password', {username: 'email@email.com', password: 'notValid'}],
            ['Invalid email', {username: 'notValidEmail@email.com', password: 'test123'}]
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

    
});

