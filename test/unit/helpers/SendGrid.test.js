var sgMail = require('@sendgrid/mail');
jest.mock('@sendgrid/mail');

const axios = require('axios');
jest.mock('axios');

process.env.SENDGRID_API_KEY = 'testApiKey';

const SendGrid = require('../../../helpers/SendGrid');
const { Log } = require('../../../helpers/Logger');

describe('SendGrid Helper', () => {

    afterEach(() => {    
        jest.resetAllMocks();
    });

    test('Test api key setup', () => {
        expect(sgMail.setApiKey).toHaveBeenCalledWith('testApiKey');
    });

    test('Test sendResetPasswordEmail - Success', async (done) => {
        var email = "test@email.com";
        var full_name = "Full Name";
        var resetLink = '/reset/link';

        var actualUrl = null;
        var actualBody = null;
        var actualOptions = null;
        jest.spyOn(axios, 'post')
            .mockImplementation((url, body, options) => {
                actualUrl = url;
                actualBody = body;
                actualOptions = options;
                return true;
            })

        var result = await SendGrid.sendResetPasswordEmail(email, full_name, resetLink);

        expect(result).toEqual(true);
        expect(actualUrl).not.toBeNull();
        expect(actualUrl).toEqual('https://api.sendgrid.com/v3/mail/send');

        expect(actualOptions).not.toBeNull();
        expect(actualOptions).toHaveProperty('headers');
        expect(actualOptions.headers).toHaveProperty('content-type', 'application/json');
        expect(actualOptions.headers).toHaveProperty('authorization', 'Bearer testApiKey');

        expect(actualBody).not.toBeNull();
        var bodyStr = JSON.stringify(actualBody);
        expect(bodyStr).toContain(email);
        expect(bodyStr).toContain(full_name);
        expect(bodyStr).toContain(resetLink);    

        done();
    });

    test('Test sendResetPasswordEmail - 400 level error', async (done) => {
        jest.spyOn(axios, 'post')
            .mockRejectedValue('400 level error');

        var errorLog = Log.prototype.error = jest.fn();

        var result = await SendGrid.sendResetPasswordEmail('email', 'full_name', 'resetLink');

        expect(result).toEqual(false);
        expect(errorLog).toHaveBeenCalledWith('Error while sending reset password email, "400 level error"');

        done();
    });

    test('Test sendSignupEmail - Success', async (done) => {
        var email = "test@email.com";
        var full_name = "Full Name";
        var signupLink = '/signup/link';

        var actualUrl = null;
        var actualBody = null;
        var actualOptions = null;
        jest.spyOn(axios, 'post')
            .mockImplementation((url, body, options) => {
                actualUrl = url;
                actualBody = body;
                actualOptions = options;
                return true;
            })

        var result = await SendGrid.sendSignupEmail(email, full_name, signupLink);

        expect(result).toEqual(true);
        expect(actualUrl).not.toBeNull();
        expect(actualUrl).toEqual('https://api.sendgrid.com/v3/mail/send');

        expect(actualOptions).not.toBeNull();
        expect(actualOptions).toHaveProperty('headers');
        expect(actualOptions.headers).toHaveProperty('content-type', 'application/json');
        expect(actualOptions.headers).toHaveProperty('authorization', 'Bearer testApiKey');

        expect(actualBody).not.toBeNull();
        var bodyStr = JSON.stringify(actualBody);
        expect(bodyStr).toContain(email);
        expect(bodyStr).toContain(full_name);
        expect(bodyStr).toContain(signupLink);    

        done();
    });

    test('Test sendSignupEmail - 400 level error', async (done) => {
        jest.spyOn(axios, 'post')
            .mockRejectedValue('400 level error');

        var errorLog = Log.prototype.error = jest.fn();

        var result = await SendGrid.sendSignupEmail('email', 'full_name', 'signupLink');

        expect(result).toEqual(false);
        expect(errorLog).toHaveBeenCalledWith('Error while sending reset password email, "400 level error"');

        done();
    });
});