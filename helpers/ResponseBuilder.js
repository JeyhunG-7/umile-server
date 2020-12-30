const { Log } = require('./Logger'),
        logger = new Log('ResponseBuilder');

function sendSuccess(req, res, data = {}) {
    const responseObject = { success: true, data }

    logger.info(`API success => ${req.originalUrl}`);

    return res.send(responseObject);
}

function sendError(req, res, message = 'Error!', devMessage = 'No dev message', data = {}) {
    const responseObject = { success: false, data, message, devMessage }

    logger.error(`API error => ${req.originalUrl} - ${message} - ${devMessage}`);

    return res.send(responseObject);
}

module.exports = { sendSuccess, sendError }