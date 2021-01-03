const ResponseBuilder = require('../../../helpers/ResponseBuilder');
const { Log } = require('../../../helpers/Logger');

describe('ResponseBuilder Helper', () => {

    afterEach(() => {    
        jest.resetAllMocks();
      });

    test('Test sendSuccess', () => {
        var infoLog = Log.prototype.info = jest.fn();
        var data = {message: 'hello', valid: true}

        var req = {
            originalUrl: '/test/url'
        }

        var res = {
            send: jest.fn()
        };

        ResponseBuilder.sendSuccess(req, res, data);

        expect(res.send).toHaveBeenCalledWith({success: true, data: data});
        expect(infoLog).toHaveBeenCalledWith('API success => /test/url');
    });

    test('Test sendError', () => {
        var errorLog = Log.prototype.error = jest.fn();

        var data = {message: 'hello', valid: false}

        var req = {
            originalUrl: '/test/url'
        }

        var res = {
            send: jest.fn()
        }

        ResponseBuilder.sendError(req, res, 'ui message', 'message to developer', data);

        expect(res.send).toHaveBeenCalledWith({
            success: false, 
            data: data, 
            message: 'ui message', 
            devMessage: 'message to developer'
        });
        expect(errorLog).toHaveBeenCalledWith('API error => /test/url - ui message - message to developer');
    });
});