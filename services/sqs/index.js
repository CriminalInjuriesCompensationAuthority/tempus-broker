'use strict';

const logger = require('../logging/logger');

// validate that the response contains JSON and PDF keys only
function validateS3Keys(keys) {
    Object.values(keys).forEach(value => {
        if (value.endsWith('.json') || value.endsWith('.pdf')) {
            logger.info(`S3 Key received from tempus broker queue: ${value}`);
        } else {
            throw new Error(
                'Tempus broker queue message held an invalid file type, only .pdf and .json are supported'
            );
        }
    });
}

// Parses the data from an event body which has been recieved from the tempus broker queue
function handleTempusBrokerMessage(data) {
    // convert message to JSON - Holds S3 object keys
    const s3Keys = JSON.parse(data);
    validateS3Keys(s3Keys);
    return s3Keys;
}

module.exports = handleTempusBrokerMessage;
