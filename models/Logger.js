function sendSuccess(req, res, data = {}) {
    const responseObject = { success: true, data }

    console.debug('API success => ', req.originalUrl);

    //TODO: save to permanent log as well

    return res.send(responseObject);
}

function sendError(req, res, message = 'Error!', devMessage = 'No dev message', data = {}) {
    const responseObject = { success: false, data, message, devMessage }

    console.error('API error => ', req.originalUrl, message, devMessage);

    //TODO: save to permanent log as well

    return res.send(responseObject);
}

module.exports = { sendSuccess, sendError }