'use strict';

const oracledb = require('oracledb');
const s3 = require('./services/s3/index');
const handleTempusBrokerMessage = require('./services/sqs/index');
const mapApplicationDataToOracleObject = require('./services/application-mapper/index');
const createDBPool = require('./db/dbPool');
const insertIntoTempus = require('./db/index');
const checkEligibility = require('./services/eligibility-checker/index');
const createJob = require('./services/kta/index');
const addressInvoiceMapper = require('./services/address-invoice-mapper');
const logger = require('./services/logging/logger');
const getParameter = require('./services/ssm');

function serialize(object) {
    return JSON.stringify(object, null, 2);
}

function extractTariffReference(applicationJson) {
    return applicationJson.meta.caseReference.split('\\')[1];
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
        const s3ApplicationData = await s3.retrieveObjectFromBucket(
            bucketName,
            Object.values(s3Keys)[1]
        );

        logger.info('Mapping application data to Oracle object.');
        const applicationOracleObject = await mapApplicationDataToOracleObject(s3ApplicationData);

        logger.info(`Successfully mapped to Oracle object: ${applicationOracleObject}`);
        const applicationFormJson = Object.values(applicationOracleObject)[0][0].APPLICATION_FORM;
        const addressDetailsJson = Object.values(applicationOracleObject)[0][1].ADDRESS_DETAILS;

        logger.info('Checking application eligibility');
        const applicationFormJsonChecked = checkEligibility(applicationFormJson);
        applicationFormJsonChecked.NEW_OAS = 'Y';
        const addressDetailsWithInvoices = addressInvoiceMapper(
            addressDetailsJson,
            applicationFormJson
        );
        logger.info('Creating Database Pool');
        dbConn = await createDBPool();

        logger.info('Writing application data into Tariff');
        await insertIntoTempus(applicationFormJsonChecked, 'APPLICATION_FORM');
        await insertIntoTempus(addressDetailsWithInvoices, 'ADDRESS_DETAILS');

        if (!(process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'test')) {
            logger.info('Deleting object from S3');
            await s3.deleteObjectFromBucket(bucketName, Object.values(s3Keys)[1]);
            logger.info('Call out to KTA SDK');
            const sessionId = await getParameter('kta-session-id');
            const inputVars = [
                {Id: 'pTARIFF_REFERENCE', Value: extractTariffReference(s3ApplicationData)},
                {Id: 'pSUMMARY_URL', Value: `s3://${bucketName}/${Object.values(s3Keys)[0]}`}
            ];
            logger.info(`InputVars: ${JSON.stringify(inputVars)}`);

            await createJob(sessionId, 'Case Work - Application for Compensation', inputVars);
        }
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
