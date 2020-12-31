const bcrypt = require('bcrypt');
const Password = require('./../../helpers/Password');
const { Log } = require('./../../helpers/Logger');


describe('Password Helper', () => {

    afterEach(() => {    
        jest.restoreAllMocks();
      });

    test('Create password hash', async (done) => {
        var password = 'testPass';
        var hash = await Password.createHashAsync(password);
        expect(hash).not.toEqual(password);
        done();
    });

    test('Hash is different, even for same input', async (done) => {
        var password1 = 'testPass';
        var password2 = 'testPass';
        var hash1_1 = await Password.createHashAsync(password1);
        var hash1_2 = await Password.createHashAsync(password1);
        var hash2 = await Password.createHashAsync(password2);
        expect(hash1_1).not.toEqual(hash1_2);
        expect(hash1_1).not.toEqual(hash2);
        done();
    });

    test('Test compare method', async (done) => {
        var password = 'testPass';
        var hash = await Password.createHashAsync(password);

        var match = await Password.compareAsync(password, hash);
        expect(match).toBeTruthy();

        match = await Password.compareAsync('some other password', hash);
        expect(match).toBeFalsy();
        done();
    });

    test('Test compare method - error case', async (done) => {

        jest.spyOn(bcrypt, 'compare')
            .mockImplementation(() => Promise.reject('Something went wrong'));

        var errorLog = Log.prototype.error = jest.fn();

        var match = await Password.compareAsync("password", "hash");
        expect(match).toBeFalsy();
        expect(errorLog).toBeCalledWith('Error while comparing password and hash: \"Something went wrong\"');
        done();
    });
});