// add express route logger
// winston express 


const winston = require('winston');
require('winston-daily-rotate-file');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.splat(),
        winston.format.simple()
    ),
    transports: [
        new (winston.transports.DailyRotateFile)({
            filename: 'log/log-%DATE%.log',
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d'
        })
    ],
  });

// add console transport if not production
if (process.env.NODE_ENV === 'development'){
    logger.add(new winston.transports.Console());
}

const getDate = function(){
    return new Date().toISOString();
}

/**
 * Log class that adds metadata when logging
 */
class Log {
    constructor(name){
        this.name = name;
    }

    info(message){
        logger.info('\t%s [%s] - %s', getDate(), this.name, message);
    }

    debug(message){
        logger.debug('\t%s [%s] - %s', getDate(), this.name, message);
    }

    error(message){
        logger.error('\t%s [%s] - %s', getDate(), this.name, message);
    }
}


const expressLogger = function(req, res, next){
    logger.info('\t%s [express] %s - %s %s HTTP:/%s', getDate(), req.connection.remoteAddress, req.method, req.url, req.httpVersion);
    next();
}

module.exports = { Log, expressLogger }




