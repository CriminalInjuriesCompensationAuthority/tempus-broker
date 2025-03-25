'use strict';

const oracledb = require('oracledb');
const s3 = require('./services/s3/index');
const createSqsService = require('./services/sqs/index');
const mapApplicationDataToOracleObject = require('./services/application-mapper/index');
const createDBPool = require('./db/dbPool');
const insertIntoTempus = require('./db/index');
const getParameter = require('./services/ssm');
const {handler, handleTempusBrokerMessage} = require('./index');
const getSecret = require('./services/secret-manager/index');
const fs = require('fs');

jest.mock('./services/s3/index');
jest.mock('./services/sqs/index');
jest.mock('./services/application-mapper/index');
jest.mock('./db/dbPool');
jest.mock('./db/index');

jest.mock('./services/ssm');
jest.mock('./constants/application-form-default');
jest.mock('./constants/address-details-default');
jest.mock('./services/secret-manager/index');

const addressDetails = [
    {
        address_type: 'ICA',
        claim_reference_number: '327507',
        ref_year: '23'
    }
];

describe('handler', () => {
    let mockClose;

    beforeEach(() => {
        jest.resetAllMocks();

        // Mock specific methods of oracledb
        mockClose = jest.fn().mockResolvedValue();
        oracledb.getPool = jest.fn().mockReturnValue({
            close: mockClose
        });
    });

    it('should process an application as eligible and return Success!', async () => {
        // Mock environment variables
        process.env.TEMPUS_QUEUE = 'fake-queue-url';
        process.env.NODE_ENV = 'test';
        process.env.TEMPUS_BROKER_SECRET_ARN = 'arn:aws:secretsmanager:eu-west-2:dummy-arn';

        // Mock SQS service
        const receiveSQS = jest.fn().mockResolvedValue({
            Messages: [
                {
                    Body: JSON.stringify({
                        applicationJSONDocumentSummaryKey: 'check-your-answers-sample.json'
                    }),
                    ReceiptHandle: 'fake-handle'
                }
            ]
        });
        const deleteSQS = jest.fn();
        createSqsService.mockReturnValue({receiveSQS, deleteSQS});

        // Mock other services and functions
        getParameter.mockResolvedValue('fake-bucket-name');
        s3.retrieveObjectFromBucket.mockResolvedValue({meta: {caseReference: '23\\327507'}});

        const applicationForm = {
            prefix: 'U',
            section_ref: 'TEMP',
            NEW_OAS: 'Y',
            is_eligible: 'Y',
            claim_reference_number: '327507',
            ref_year: '23',
            created_date: '19-MAY-2023'
        };

        mapApplicationDataToOracleObject.mockResolvedValue({
            tables: [
                {
                    APPLICATION_FORM: applicationForm
                },
                {
                    ADDRESS_DETAILS: addressDetails
                }
            ]
        });

        createDBPool.mockResolvedValue({});
        insertIntoTempus.mockResolvedValue();

        getSecret.mockResolvedValue('{"MAINTENANCE_MODE": "false", "TEST_EMAILS": "410581a0-3d5c-4d11-92dd-000000000000@gov.uk"}');

        const event = {}; // Your mock event
        const context = {}; // Your mock context
        const result = await handler(event, context);

        expect(result).toBe('Success!');
        expect(receiveSQS).toHaveBeenCalled();
        expect(deleteSQS).toHaveBeenCalledWith({
            QueueUrl: 'fake-queue-url',
            ReceiptHandle: 'fake-handle'
        });
        expect(mockClose).toHaveBeenCalled();

        const applicationFormRecieved = {
            prefix: 'U',
            section_ref: 'TEMP',
            NEW_OAS: 'Y',
            is_eligible: 'Y',
            claim_reference_number: '327507',
            ref_year: '23',
            created_date: '19-MAY-2023'
        };

        expect(insertIntoTempus).toHaveBeenNthCalledWith(
            1,
            applicationFormRecieved,
            'APPLICATION_FORM'
        );
        expect(insertIntoTempus).toHaveBeenNthCalledWith(2, addressDetails, 'ADDRESS_DETAILS');
    });

    it('should process an application as in-eligible when incident not reported to police and return Success!', async () => {
        // Mock environment variables
        process.env.TEMPUS_QUEUE = 'fake-queue-url';
        process.env.NODE_ENV = 'test';
        process.env.TEMPUS_BROKER_SECRET_ARN = 'arn:aws:secretsmanager:eu-west-2:dummy-arn';

        // Mock SQS service
        const receiveSQS = jest.fn().mockResolvedValue({
            Messages: [
                {
                    Body: JSON.stringify({
                        applicationJSONDocumentSummaryKey: 'check-your-answers-sample.json'
                    }),
                    ReceiptHandle: 'fake-handle'
                }
            ]
        });
        const deleteSQS = jest.fn();
        createSqsService.mockReturnValue({receiveSQS, deleteSQS});

        // Mock other services and functions
        getParameter.mockResolvedValue('fake-bucket-name');
        s3.retrieveObjectFromBucket.mockResolvedValue({meta: {caseReference: '23\\327507'}});

        const applicationForm = {
            prefix: 'U',
            section_ref: 'TEMP',
            NEW_OAS: 'Y',
            is_eligible: 'Y',
            incident_rep_police: 'N',
            claim_reference_number: '327507',
            ref_year: '23',
            created_date: '19-MAY-2023'
        };

        mapApplicationDataToOracleObject.mockResolvedValue({
            tables: [
                {
                    APPLICATION_FORM: applicationForm
                },
                {
                    ADDRESS_DETAILS: addressDetails
                }
            ]
        });

        createDBPool.mockResolvedValue({});
        insertIntoTempus.mockResolvedValue();

        getSecret.mockResolvedValue('{"MAINTENANCE_MODE": "false", "TEST_EMAILS": "410581a0-3d5c-4d11-92dd-000000000000@gov.uk"}');

        const event = {}; // Your mock event
        const context = {}; // Your mock context
        const result = await handler(event, context);

        expect(result).toBe('Success!');
        expect(receiveSQS).toHaveBeenCalled();
        expect(deleteSQS).toHaveBeenCalledWith({
            QueueUrl: 'fake-queue-url',
            ReceiptHandle: 'fake-handle'
        });
        expect(mockClose).toHaveBeenCalled();

        const applicationFormRecieved = {
            prefix: 'U',
            section_ref: 'TEMP',
            NEW_OAS: 'Y',
            is_eligible: 'N',
            incident_rep_police: 'N',
            claim_reference_number: '327507',
            ref_year: '23',
            created_date: '19-MAY-2023'
        };
        expect(insertIntoTempus).toHaveBeenNthCalledWith(
            1,
            applicationFormRecieved,
            'APPLICATION_FORM'
        );
        expect(insertIntoTempus).toHaveBeenNthCalledWith(2, addressDetails, 'ADDRESS_DETAILS');
    });

    it('should process an application as in-eligible when applicant previously applied and return Success!', async () => {
        // Mock environment variables
        process.env.TEMPUS_QUEUE = 'fake-queue-url';
        process.env.NODE_ENV = 'test';
        process.env.TEMPUS_BROKER_SECRET_ARN = 'arn:aws:secretsmanager:eu-west-2:dummy-arn';

        // Mock SQS service
        const receiveSQS = jest.fn().mockResolvedValue({
            Messages: [
                {
                    Body: JSON.stringify({
                        applicationJSONDocumentSummaryKey: 'check-your-answers-sample.json'
                    }),
                    ReceiptHandle: 'fake-handle'
                }
            ]
        });
        const deleteSQS = jest.fn();
        createSqsService.mockReturnValue({receiveSQS, deleteSQS});

        // Mock other services and functions
        getParameter.mockResolvedValue('fake-bucket-name');

        const s3applicationData = {
            meta: {
                caseReference: '23\\327507',
                submittedDate: '2023-05-19T13:06:12.693Z',
                splitFuneral: false
            },
            themes: [
                {
                    type: 'theme',
                    id: 'about-application',
                    title: 'About your application',
                    values: [
                        {
                            id: 'q-applicant-applied-before-for-this-crime',
                            type: 'simple',
                            value: true,
                            theme: 'about-application'
                        }
                    ]
                }
            ]
        };

        s3.retrieveObjectFromBucket.mockResolvedValue(s3applicationData);

        const applicationForm = {
            prefix: 'U',
            section_ref: 'TEMP',
            NEW_OAS: 'Y',
            is_eligible: 'Y',
            claim_reference_number: '327507',
            ref_year: '23',
            created_date: '19-MAY-2023',
            previous_application_submitted: 'Y',
            prev_app_for_ci_comp: 'Y'
        };

        mapApplicationDataToOracleObject.mockResolvedValue({
            tables: [
                {
                    APPLICATION_FORM: applicationForm
                },
                {
                    ADDRESS_DETAILS: addressDetails
                }
            ]
        });

        createDBPool.mockResolvedValue({});
        insertIntoTempus.mockResolvedValue();

        getSecret.mockResolvedValue('{"MAINTENANCE_MODE": "false", "TEST_EMAILS": "410581a0-3d5c-4d11-92dd-000000000000@gov.uk"}');

        const event = {}; // Your mock event
        const context = {}; // Your mock context
        const result = await handler(event, context);

        expect(result).toBe('Success!');
        expect(receiveSQS).toHaveBeenCalled();
        expect(deleteSQS).toHaveBeenCalledWith({
            QueueUrl: 'fake-queue-url',
            ReceiptHandle: 'fake-handle'
        });
        expect(mockClose).toHaveBeenCalled();

        const applicationFormIneligible = {
            prefix: 'U',
            section_ref: 'TEMP',
            NEW_OAS: 'Y',
            is_eligible: 'N',
            claim_reference_number: '327507',
            ref_year: '23',
            created_date: '19-MAY-2023',
            previous_application_submitted: 'Y',
            prev_app_for_ci_comp: 'Y'
        };
        expect(insertIntoTempus).toHaveBeenNthCalledWith(
            1,
            applicationFormIneligible,
            'APPLICATION_FORM'
        );
        expect(insertIntoTempus).toHaveBeenNthCalledWith(2, addressDetails, 'ADDRESS_DETAILS');
    });

    it(`should process an application as in-eligible when not reported to police 
        and applicant has not previously applied and return Success!`, async () => {
        // Mock environment variables
        process.env.TEMPUS_QUEUE = 'fake-queue-url';
        process.env.NODE_ENV = 'test';
        process.env.TEMPUS_BROKER_SECRET_ARN = 'arn:aws:secretsmanager:eu-west-2:dummy-arn';

        // Mock SQS service
        const receiveSQS = jest.fn().mockResolvedValue({
            Messages: [
                {
                    Body: JSON.stringify({
                        applicationJSONDocumentSummaryKey: 'check-your-answers-sample.json'
                    }),
                    ReceiptHandle: 'fake-handle'
                }
            ]
        });
        const deleteSQS = jest.fn();
        createSqsService.mockReturnValue({receiveSQS, deleteSQS});

        // Mock other services and functions
        getParameter.mockResolvedValue('fake-bucket-name');

        const s3applicationData = {
            meta: {
                caseReference: '23\\327507',
                submittedDate: '2023-05-19T13:06:12.693Z',
                splitFuneral: false
            },
            themes: [
                {
                    type: 'theme',
                    id: 'about-application',
                    title: 'About your application',
                    values: [
                        {
                            id: 'q-applicant-applied-before-for-this-crime',
                            type: 'simple',
                            value: true,
                            theme: 'about-application'
                        }
                    ]
                }
            ]
        };

        s3.retrieveObjectFromBucket.mockResolvedValue(s3applicationData);

        const applicationForm = {
            prefix: 'U',
            section_ref: 'TEMP',
            NEW_OAS: 'Y',
            is_eligible: 'Y',
            claim_reference_number: '327507',
            ref_year: '23',
            created_date: '19-MAY-2023',
            incident_rep_police: 'N',
            previous_application_submitted: 'N',
            prev_app_for_ci_comp: 'N'
        };

        mapApplicationDataToOracleObject.mockResolvedValue({
            tables: [
                {
                    APPLICATION_FORM: applicationForm
                },
                {
                    ADDRESS_DETAILS: addressDetails
                }
            ]
        });

        createDBPool.mockResolvedValue({});
        insertIntoTempus.mockResolvedValue();

        getSecret.mockResolvedValue('{"MAINTENANCE_MODE": "false", "TEST_EMAILS": "410581a0-3d5c-4d11-92dd-000000000000@gov.uk"}');

        const event = {}; // Your mock event
        const context = {}; // Your mock context
        const result = await handler(event, context);

        expect(result).toBe('Success!');
        expect(receiveSQS).toHaveBeenCalled();
        expect(deleteSQS).toHaveBeenCalledWith({
            QueueUrl: 'fake-queue-url',
            ReceiptHandle: 'fake-handle'
        });
        expect(mockClose).toHaveBeenCalled();
        const applicationFormIneligible = {
            prefix: 'U',
            section_ref: 'TEMP',
            NEW_OAS: 'Y',
            is_eligible: 'N',
            claim_reference_number: '327507',
            ref_year: '23',
            created_date: '19-MAY-2023',
            incident_rep_police: 'N',
            previous_application_submitted: 'N',
            prev_app_for_ci_comp: 'N'
        };
        expect(insertIntoTempus).toHaveBeenNthCalledWith(
            1,
            applicationFormIneligible,
            'APPLICATION_FORM'
        );
        expect(insertIntoTempus).toHaveBeenNthCalledWith(2, addressDetails, 'ADDRESS_DETAILS');
    });

    it('should return "Nothing to process" if no messages received', async () => {
        // Mock SQS service
        const receiveSQS = jest.fn().mockResolvedValue({Messages: null});
        createSqsService.mockReturnValue({receiveSQS});

        const event = {}; // Your mock event
        const context = {}; // Your mock context

        const result = await handler(event, context);

        expect(result).toBe('Nothing to process');
        expect(receiveSQS).toHaveBeenCalled();
    });

    it('Should parse message body correctly', async () => {
        const sqsMessage = fs.readFileSync('function/resources/testing/sqsMessage.json');
        const response = handleTempusBrokerMessage(JSON.parse(sqsMessage).Messages[0].Body);
        expect(Object.keys(response)).toContain('applicationJSONDocumentSummaryKey');
        expect(Object.keys(response)).toContain('applicationPDFDocumentSummaryKey');
    });

    describe('In maintenance mode', () => {
        let receiveSQS, deleteSQS;
        let event, context;
        let s3applicationData;

        beforeEach(() => {
            // Mock environment variables
            process.env.TEMPUS_QUEUE = 'fake-queue-url';
            process.env.NODE_ENV = 'test';
            process.env.TEMPUS_BROKER_SECRET_ARN = 'arn:aws:secretsmanager:eu-west-2:dummy-arn:maitnenance-mode-on';

            // Mock SQS service
            receiveSQS = jest.fn().mockResolvedValue({
                Messages: [
                    {
                        Body: JSON.stringify({
                            applicationJSONDocumentSummaryKey: 'check-your-answers-sample.json'
                        }),
                        ReceiptHandle: 'fake-handle'
                    }
                ]
            });
            deleteSQS = jest.fn();
            createSqsService.mockReturnValue({ receiveSQS, deleteSQS });

            // Define shared mock data
            s3applicationData = {
                meta: {
                    caseReference: '23\\327507',
                    submittedDate: '2023-05-19T13:06:12.693Z',
                    splitFuneral: false
                },
                themes: [
                    {
                        type: 'theme',
                        id: 'applicant-details',
                        title: 'Your details',
                        values: [
                            {
                                id: 'q-applicant-enter-your-email-address',
                                type: 'simple',
                                label: 'Email address',
                                value: '', // Will be set per test
                                sectionId: 'p-applicant-confirmation-method',
                                theme: 'applicant-details'
                            }
                        ]
                    }
                ]
            };

            s3.retrieveObjectFromBucket.mockResolvedValue(s3applicationData);

            mapApplicationDataToOracleObject.mockResolvedValue({
                tables: [
                    {
                        APPLICATION_FORM: {
                            prefix: 'U',
                            section_ref: 'TEMP',
                            NEW_OAS: 'Y',
                            is_eligible: 'Y',
                            claim_reference_number: '327507',
                            ref_year: '23',
                            created_date: '19-MAY-2023'
                        }
                    },
                    {
                        ADDRESS_DETAILS: addressDetails
                    }
                ]
            });

            createDBPool.mockResolvedValue({});
            insertIntoTempus.mockResolvedValue();

            getSecret.mockResolvedValue('{"MAINTENANCE_MODE": "true", "TEST_EMAILS": "410581a0-3d5c-4d11-92dd-e9f942e10817@gov.uk"}');

            event = {}; // Your mock event
            context = {}; // Your mock context
        });

        it('should return "Nothing to process" if external traffic is received', async () => {
            // Set email to a non-test address
            s3applicationData.themes[0].values[0].value = 'dc02c225-fec8-43a3-8bdd-5775039e9c0b@gov.uk';

            const result = await handler(event, context);

            expect(result).toBe('Nothing to process');
            expect(receiveSQS).toHaveBeenCalled();
        });

        it('should return "Success!" if test traffic is received', async () => {
            // Set email to a test address
            s3applicationData.themes[0].values[0].value = '410581a0-3d5c-4d11-92dd-e9f942e10817@gov.uk';

            const result = await handler(event, context);

            expect(result).toBe('Success!');
            expect(receiveSQS).toHaveBeenCalled();
        });
    });

});
