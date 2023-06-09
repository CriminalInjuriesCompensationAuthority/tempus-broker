'use strict';

const oracledb = require('oracledb');
const retrieveObjectFromBucket = require('./services/s3/index');
const handleTempusBrokerMessage = require('./services/sqs/index');
const mapApplicationDataToOracleObject = require('./services/application-mapper/index');
const createDBPool = require('./db/dbPool');
const insertIntoTempus = require('./db/index');
const logger = require('./services/logging/logger');
const getParameter = require('./services/ssm');

function serialize(object) {
    return JSON.stringify(object, null, 2);
}

exports.handler = async function(event, context) {
    logger.info(`## CONTEXT: ${serialize(context)}`);
    logger.info(`## EVENT: ${serialize(event)}`);

    // Currently the tempus broker is setup to handle one event at a time
    const record = event.Records[0];
    logger.info('Tempus broker message recieved: ', record.body);
    let dbConn;

    try {
        logger.info('Retrieving data from bucket.');
        const bucketName = await getParameter('kta-bucket-name');
        const s3Keys = await handleTempusBrokerMessage(record.body);
        const s3ApplicationData = await retrieveObjectFromBucket(
            bucketName,
            Object.values(s3Keys)[1]
        );

        logger.info('Mapping application data to Oracle object.');
        const applicationOracleObject = await mapApplicationDataToOracleObject(s3ApplicationData);

        const applicationFormJson = Object.values(applicationOracleObject)[0][0].APPLICATION_FORM;
        const addressDetailsJson = Object.values(applicationOracleObject)[0][1].ADDRESS_DETAILS;

        dbConn = await createDBPool();

        logger.info('Writing application data into Tariff');
        await insertIntoTempus(applicationFormJson, 'APPLICATION_FORM');
        await insertIntoTempus(addressDetailsJson, 'ADDRESS_DETAILS');

        /** ----------------------- TO-DO -----------------------
         *
         *  Delete JSON from S3
         *  Send request to KTA with S3 Key
         *
         *
         *  -----------------------       -----------------------
         */
    } catch (error) {
        logger.error(error);
        throw error;
    } finally {
        if (dbConn) {
            await oracledb.getPool('TempusBrokerPool').close(0);
        }
    }

    return 'Success!';
};
