const Validator = require('../../../helpers/Validator');

describe('Validator', () => {

    test('Test success', () => {
        const check = Validator.verifyParams({
            someId: 1,
            inner: { text: 'some text', arr: [1, 2, 3] },
            email: 'test@email.com',
            active: 'true',
            submitted: 'false'
        },
            {
                someId: 'integer',
                inner: { text: 'string', arr: 'array' },
                email: 'email', active: 'boolean', submitted: 'boolean'
            });

        expect(check).toBe(null);
    });

    test.each([
        ['Missing key', { text: 'test123' }, { text: 'string', something: 'email' }],
        ['Key is undefined', { text: undefined }, { text: 'string' }],
        ['Key is null', { text: null }, { text: 'string' }],
        ['Inner object missing key', { text: 'text', obj: {} }, { text: 'string', obj: { color: 'hex_color' } }],
        ['Extra key', { text: 'text', color: '#t4t59g' }, { text: 'string' }],
        ['Non boolean', { active: 'asdas' }, { active: 'boolean' }],
    ])
        ('%s', (_s, obj, params) => {
            const check = Validator.verifyParams(obj, params);

            expect(typeof check).toBe('string');
        });
});