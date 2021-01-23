const { app } = require('../../../app');
const request = require('supertest');
const http = require('http');

const { builder, TABLES } = require('../../../helpers/Database');

describe('Places API', () => {
    let server, auth_token;

    beforeAll(async done => {
        // insert client
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

        await builder()
            .table(TABLES.places)
            .insert({
                provider_id: 'id1',
                address: '123 street bla',
                geom: `0101000000462575029A845CC0CB10C7BAB8854940`
            });

        await builder()
            .table(TABLES.places)
            .insert({
                provider_id: 'id2',
                address: '125 street bla',
                geom: `0101000000006F8104C5C351C012A5BDC1172E4540`
            });

        server = http.createServer(app);

        server.listen(async () => {
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

            auth_token = loginResponse.body.data;

            done();
        })
    })

    afterAll(async done => {
        // remove added places and test client
        await builder()
            .table(TABLES.places)
            .delete();

        await builder()
            .table(TABLES.clients)
            .where('email', 'client@email.com')
            .delete();

        server.close(done);
    })

    afterEach(() => jest.resetAllMocks());

    test.each([
        ["Search with 'test'", { term: 'test' }, 0],
        ['Search with 12', { term: '12' }, 2],
        ['Search with 123', { term: '123' }, 1],
        ['Scenario with empty term', { term: '' }, 2]
    ])
        ('GET places/search - %s', async (textName, data, expectLength, done) => {

            const response = await request(server)
                .get("/api/places/search")
                .auth(auth_token, { type: 'bearer' })
                .query(data);

            expect(response.status).toEqual(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveLength(expectLength);
            done();
        });

    test('GET places/search - Missing params', async done => {

        const response = await request(server)
            .get("/api/places/search")
            .auth(auth_token, { type: 'bearer' });

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'Request is missing params!');
        done();
    });

    test('GET places/search - Missing auth token', async done => {

        const response = await request(server)
            .get("/api/places/search")
            .query({ term: 'test' });

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'Invalid email or password');
        done();
    });

    test('GET places/save - Success', async done => {

        const response = await request(server)
            .post("/api/places/save")
            .auth(auth_token, { type: 'bearer' })
            .send({
                providerId: 'providerId',
                address: '123 street SW',
                type: 'some type',
                lat: 55.7324,
                lng: -114.7324
            })

        expect(response.status).toEqual(200)
        expect(response.body).toHaveProperty('success', true)
        expect(response.body).toHaveProperty('data')
        expect(typeof response.body.data).toBe('number');

        done();
    });

    test('GET places/save - Duplicate entry', async done => {

        const response = await request(server)
            .post("/api/places/save")
            .send({
                providerId: 'providerId',
                address: '123 street SW',
                type: 'some type',
                lat: 55.7324,
                lng: -114.7324
            })
            .auth(auth_token, { type: 'bearer' });

        expect(response.status).toEqual(200)
        expect(response.body).toHaveProperty('success', false)
        done();
    });

    test('GET places/save - Missing auth token', async done => {

        const response = await request(server)
            .post("/api/places/save")
            .send({
                providerId: 'providerId',
                address: '123 street SW',
                type: 'some type',
                lat: 55.7324,
                lng: -114.7324
            });

        expect(response.status).toEqual(200)
        expect(response.body).toHaveProperty('success', false)
        expect(response.body).toHaveProperty('message', 'Invalid email or password')
        done();
    });
});

