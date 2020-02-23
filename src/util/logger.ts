import * as winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file"
/**
 * //TODO: change logger configuration to configuration file
 */

var fileRotateTransport = new DailyRotateFile({
    filename: 'application-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '100',
    utc: true,
    dirname: './logs',
    level:"debug"
  });

const options: winston.LoggerOptions = {
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.simple()
      ),

    transports: [
        new winston.transports.Console({
            level: process.env.NODE_ENV === "production" ? "error" : "debug"
        }),
        fileRotateTransport
    ]
};


const logger = winston.createLogger(options);

if (process.env.NODE_ENV !== "production") {
    logger.debug("Logging initialized at debug level");
}

export default logger;
