'use strict';

require('dotenv').config();
const oracledb = require('oracledb');
const s3 = require('./services/s3/index');
const createSqsService = require('./services/sqs/index');
const mapApplicationDataToOracleObject = require('./services/application-mapper/index');
const createDBPool = require('./db/dbPool');
const insertIntoTempus = require('./db/index');
const setEligibility = require('./services/eligibility-checker/index');
const createJob = require('./services/kta/index');
const addressInvoiceMapper = require('./services/address-invoice-mapper');
const logger = require('./services/logging/logger');
const getParameter = require('./services/ssm');
const getApplicationFormDefault = require('./constants/application-form-default');
const getAddressDetailsDefault = require('./constants/address-details-default');

function serialize(object) {
    return JSON.stringify(object, null, 2);
}

function extractTariffReference(applicationJson) {
    return applicationJson.meta.caseReference.split('\\')[1];
}

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


function getAnswerFromThemes (themes, themeId, answerId) {
    return themes.find(theme => theme.id === themeId)
        ?.values?.find(answer => answer.id === answerId)
        ?.value;
}

function getApplicationOrigin(applicationData){
    const testEmails = process.env.TEST_EMAILS || '';

    const themesArray = applicationData.themes || [];

    const emailAddresses = [
        getAnswerFromThemes(themesArray, 'applicant-details', 'q-applicant-enter-your-email-address'),
        getAnswerFromThemes(themesArray, 'main-applicant-details', 'q-mainapplicant-enter-your-email-address'),
        getAnswerFromThemes(themesArray, 'rep-details', 'q-rep-email-address')
    ];

    return emailAddresses.some(email => email && testEmails.includes(email)) ? "internal" : "external";
}

async function handler(event, context) {
    const applicationFormDefault = getApplicationFormDefault();
    const addressDetailsDefault = getAddressDetailsDefault();
    logger.info(`## CONTEXT: ${serialize(context)}`);
    logger.info(`## EVENT: ${serialize(event)}`);

    const sqsService = createSqsService();

    // Currently the tempus broker is setup to handle one event at a time
    const receiveInput = {
        QueueUrl: process.env.TEMPUS_QUEUE,
        MaxNumberOfMessages: 1
    };
    const response = await sqsService.receiveSQS(receiveInput);

    // Return early if there are no messages to consume.
    if (!response.Messages) {
        logger.info('No messages received');
        return 'Nothing to process';
    }

    const message = response.Messages[0];
    logger.info('Message received from SQS queue: ', message);

    let dbConn;

    try {
        logger.info('Retrieving data from bucket.');
        const bucketName = await getParameter('kta-bucket-name');
        const s3Keys = handleTempusBrokerMessage(message.Body);
        const s3ApplicationData = await s3.retrieveObjectFromBucket(
            bucketName,
            Object.values(s3Keys)[1]
        );

        const maintenanceMode = process.env.MAINTENANCE_MODE === 'true';

        // Return early if the service is in maintenance mode and the traffic is external.
        if (maintenanceMode && getApplicationOrigin(s3ApplicationData) === 'external') {
            logger.info('External traffic received. Maintenance mode is on.');
            return 'Nothing to process';
        }

        logger.info('Mapping application data to Oracle object.');
        const applicationOracleObject = await mapApplicationDataToOracleObject(
            s3ApplicationData,
            applicationFormDefault,
            addressDetailsDefault
        );

        logger.info(`Successfully mapped to Oracle object: ${applicationOracleObject}`);
        const applicationFormJson = Object.values(applicationOracleObject)[0][0].APPLICATION_FORM;
        const addressDetailsJson = Object.values(applicationOracleObject)[0][1].ADDRESS_DETAILS;

        logger.info('Checking application eligibility');
        setEligibility(s3ApplicationData, applicationFormJson);

        const addressDetailsWithInvoices = addressInvoiceMapper(
            addressDetailsJson,
            applicationFormJson
        );
        logger.info('Creating Database Pool');
        dbConn = await createDBPool();

        logger.info('Writing application data into Tariff');

        await insertIntoTempus(applicationFormJson, 'APPLICATION_FORM');
        await insertIntoTempus(addressDetailsWithInvoices, 'ADDRESS_DETAILS');

        if (!(process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'test')) {
            logger.info('Call out to KTA SDK');
            const sessionId = await getParameter('kta-session-id');
            const inputVars = [
                {Id: 'pTARIFF_REFERENCE', Value: extractTariffReference(s3ApplicationData)},
                {Id: 'pSUMMARY_URL', Value: `s3://${bucketName}/${Object.values(s3Keys)[0]}`}
            ];
            logger.info(`InputVars: ${JSON.stringify(inputVars)}`);

            await createJob(sessionId, 'Case Work - Application for Compensation', inputVars);
        }

        // Finally delete the consumed message from the Tempus Queue
        const deleteInput = {
            QueueUrl: process.env.TEMPUS_QUEUE,
            ReceiptHandle: message.ReceiptHandle
        };
        sqsService.deleteSQS(deleteInput);
    } catch (error) {
        logger.error(error);
        throw error;
    } finally {
        if (dbConn) {
            await oracledb.getPool('TempusBrokerPool').close(0);
        }
    }

    return 'Success!';
}

module.exports = {handler, handleTempusBrokerMessage};
