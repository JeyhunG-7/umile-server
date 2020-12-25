const SimpleNodeLogger = require('simple-node-logger'),
    opts = {
        logFilePath:'server.log',
        timestampFormat:'YYYY-MM-DD HH:mm:ss.SSS'
    },
log = SimpleNodeLogger.createSimpleLogger( opts );

exports.log = log;