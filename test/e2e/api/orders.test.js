const { app } = require('../../../app');
const request = require('supertest');
const http = require('http');

const { builder, TABLES } = require('../../../helpers/Database');

describe('Orders API', () => {
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

        await builder()
            .table(TABLES.clients)
            .where('email', 'client@email.com')
            .delete();

        await builder()
            .table(TABLES.places)
            .delete();

        server.close(done);
    })

    test('GET orders/list - Empty list', async done => {

        const response = await request(server)
            .get("/api/orders/list")
            .query({ cityId: 1 })
            .auth(auth_token, { type: 'bearer' });

        expect(response.status).toEqual(200)
        expect(response.body).toHaveProperty('success', true)
        expect(response.body).toHaveProperty('data')
        expect(response.body.data).toHaveLength(0)
        done();
    });

    test('GET orders/list - Missing auth token', async done => {

        const response = await request(server)
            .get("/api/orders/list")
            .query({ cityId: 1 });

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('message', 'Invalid email or password');
        done();
    });

    test('GET orders/place - Success!', async done => {

        const response = await request(server)
            .post("/api/orders/place")
            .auth(auth_token, { type: 'bearer' })
            .send({
                cityId: 1,
                pickup: { note: 'some note for pikcup', placeId: 1 },
                dropoff: { note: 'some note for dropoff', placeId: 2 },
            })

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('success', true);
        expect(typeof response.body.data).toBe('number');
        done();
    });

    test('GET orders/list - 1 order', async done => {

        const response = await request(server)
            .get("/api/orders/list")
            .query({ cityId: 1 })
            .auth(auth_token, { type: 'bearer' });

        expect(response.status).toEqual(200)
        expect(response.body).toHaveProperty('success', true)
        expect(response.body).toHaveProperty('data')
        expect(response.body.data).toHaveLength(1)
        done();
    });

    test('GET orders/place - Non existant place id', async done => {

        const response = await request(server)
            .post("/api/orders/place")
            .auth(auth_token, { type: 'bearer' })
            .send({
                cityId: 1,
                pickup: { note: 'some note for pikcup', placeId: 1 },
                dropoff: { note: 'some note for dropoff', placeId: 3 },
            })

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('success', false);
        done();
    });
});

