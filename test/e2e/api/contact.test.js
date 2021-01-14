jest.mock('./../../../helpers/SendGrid');

// Setup express for testing
const { app } = require('./../../../app');
const request = require('supertest');
const http = require('http');

const { builder, TABLES } = require('./../../../helpers/Database');

describe('Contact API', () => {
    var server;

    beforeAll(async (done) => {
        server = http.createServer(app);
        server.listen(done)
    })

    afterAll(async (done) => {
        server.close(done);
    })

    afterEach(() => {
        jest.resetAllMocks();
    })

    test('POST /getintouch - Success', async (done) => {
        var email = 'client@email.com';
        var name = 'Fname Lname';
        var message = 'This is test message';

        var response = await request(server)
            .post("/api/contact/getintouch")
            .type('form')
            .send({
                email: email,
                name: name,
                message: message
            })
            .set('Accept', 'application\\json');

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', true);

        expect(await _isEntryInDatabase(email, name, message)).toEqual(true);

        done();
    });

    test('POST /getintouch - Can enter same name and email', async (done) => {
        var email = 'client@email.com';
        var name = 'Fname Lname';
        var message1 = 'This is test message';
        var message2 = 'This is second test message';

        var response = await request(server)
            .post("/api/contact/getintouch")
            .type('form')
            .send({
                email: email,
                name: name,
                message: message1
            })
            .set('Accept', 'application\\json');

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', true);
        expect(await _isEntryInDatabase(email, name, message1)).toEqual(true);

        response = await request(server)
            .post("/api/contact/getintouch")
            .type('form')
            .send({
                email: email,
                name: name,
                message: message2
            })
            .set('Accept', 'application\\json');

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', true);
        expect(await _isEntryInDatabase(email, name, message2)).toEqual(true);

        done();
    });

    test('POST /getintouch - Can add messages with 160 characters', async (done) => {
        var email = 'client@email.com';
        var name = 'Fname Lname';
        var message = Array(161).join('m'); //creates string with 160 m

        var response = await request(server)
            .post("/api/contact/getintouch")
            .type('form')
            .send({
                email: email,
                name: name,
                message: message
            })
            .set('Accept', 'application\\json');

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', true);

        expect(await _isEntryInDatabase(email, name, message)).toEqual(true);

        done();
    });

    test('POST /getintouch - Cannot add messages with more than 160 characters', async (done) => {
        var email = 'client@email.com';
        var name = 'Fname Lname';
        var message = Array(162).join('m'); //creates string with 161 m

        var response = await request(server)
            .post("/api/contact/getintouch")
            .type('form')
            .send({
                email: email,
                name: name,
                message: message
            })
            .set('Accept', 'application\\json');

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', false);

        expect(await _isEntryInDatabase(email, name, message)).toEqual(false);

        done();
    });

    test.each([
            ['Missing email', {email: 'client@email.com', message: 'message'}],
            ['Missing message', {email: 'client@email.com', name: 'Test Name'}],
            ['Missing name', {email: 'client@email.com', message: 'message'}]
        ])
        ('POST /getintouch - %s', async (textName, data, done) => {
        var response = await request(server)
            .post("/api/contact/getintouch")
            .type('form')
            .send(data)
            .set('Accept', 'application\\json');

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'Request is missing params!');
        done();
    });   
});

async function _isEntryInDatabase(email, name, message){
    var result = await builder()
        .select('*')
        .table(TABLES.contactus_messages)
        .where({ email, name, message});
    return result && result.length > 0;
}

