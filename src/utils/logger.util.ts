/**
 * Utility for logging application events and errors.
 * @file logger.util.ts
 * @module logger
 * @category utils
 * @subcategory logging
 */

import { format, createLogger, transports } from 'winston';
import rTracer from 'cls-rtracer'; // Middleware for tracking request IDs
import 'winston-daily-rotate-file'; // Module for rotating log files daily
import app_constants from '../constants/app';
import logger_config from '../config/logger';

const { combine, timestamp, printf } = format;


// Custom log message format
const customFormat = printf(({ level, message, timestamp }) => {
    const rid = rTracer.id(); // Retrieve request ID from the tracer
    return rid
        ? `${timestamp} [request-id:${rid}] || ${level}: ${message} \n` + '.'.repeat(150)
        : `${timestamp}: ${message} \n` + '.'.repeat(150);
});


// Daily rotating file transport configuration
const fileRotateTransport = new transports.DailyRotateFile({
    filename: logger_config.filename,
    datePattern: logger_config.datePattern,
    frequency: logger_config.frequency,
    maxSize: logger_config.maxSize,
    maxFiles: logger_config.maxFiles,
    dirname: logger_config.dirname,
});


// Create the logger instance with specified settings
export const logger = createLogger({
    level: 'debug', // Set the logging level
    format: combine(timestamp(), customFormat), // Combine timestamp with custom format
    transports: [fileRotateTransport], // Use the rotating file transport
});


/**
 * Logs an error message and optionally sends a response.
 * @function errorLogger
 * @param {Error} ex - The error object to log.
 * @param {any} data - Optional data to include with the log.
 * @param {Response} res - Optional response object to send an error response.
 * @returns {Promise<void>} - A promise that resolves when logging is complete.
 */
export const errorLogger = async (ex: Error, data: any = null, res?: any): Promise<void> => {
    console.log(ex);

    if (ex) {
        const stack_line = ex.stack?.split('\n')[1]; // Get the second line of the error stack
        const path = stack_line ? stack_line.trim() : 'Unknown path'; // Safely assign the string

        // Log the error message along with its stack path
        logger.error(JSON.stringify({ msg: `${ex.message} ${path}`, data }));
    };

    // If a response object is provided, send an error response
    if (res) {
        res.status(app_constants.INTERNAL_SERVER_ERROR).json({
            success: 0,
            status_code: app_constants.INTERNAL_SERVER_ERROR,
            message: ex.message,
        });
    };
};


export default logger;