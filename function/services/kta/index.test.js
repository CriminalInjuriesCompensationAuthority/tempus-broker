'use strict';

const kta = require('.');
const KtaNtlmClient = require('./ntlmClient');

describe('KTA Service', () => {
    let spy;

    describe('createJob', () => {

        beforeAll(() => {
            spy = jest.fn();
            spy = jest.spyOn(KtaNtlmClient, 'sendRequest');
        });

        const sessionId = 'D26400A6DA134810BF579A2B27E8E391';
        const inputVars = [
            {Id: 'TARIFF_REFERENCE', Value: '12\\3456789'},
            {Id: 'SUMMARY_URL', Value: 'location/file.pdf'}
        ];

        it('Should call NTLM client successfully.', async () => {
            spy.mockImplementation(() => Promise.resolve('Success'));
            await expect(
                kta.createJob(sessionId, 'Case Work - Application for Compensation', inputVars)
            ).resolves.toBe('Success');
        });

        it('Should fail gracefully.', async () => {
            spy.mockImplementation(() => Promise.reject(new Error('Failure')));
            await expect(
                kta.createJob(sessionId, 'Case Work - Application for Compensation', inputVars)
            ).rejects.toEqual(new Error('Failure'));
        });

        afterAll(() => {
            jest.restoreAllMocks();
        });
    })

    describe('getJob', () => {

        beforeAll(() => {
            spy = jest.fn();
            spy = jest.spyOn(KtaNtlmClient, 'sendRequest');
        });

        const sessionId = 'D26400A6DA134810BF579A2B27E8E391';
        const params = {
            sessionId,
            useDefaultQuery: false,
            queryIdentity: null,
            jobQueryFilter: {
                Job: {
                    Id: ''
                },
                SubJobId: '',
                Case: {
                    CaseReference: '',
                    CaseId: ''
                },
                Creator: {
                    ResourceType: 0
                },
                IsWorkerResource: false,
                Process: {
                    Id: '8ECF206F3DD5493FA21BB3D90611DFA3',
                    Name: 'Case Work - Application for Compensation',
                    Version: 0
                },
                JobStatus: 1,
                OriginServer: {},
                MaxNumberToRetrieve: 100,
                Category: {
                    Id: 'DF6F07856D1D47BBB68F35901162EAD1',
                    Name: 'All'
                },
                SearchInSubcategories: false,
                UseJobPriority: false,
                JobPriority: 0,
                WorkQueueDefinition: {
                    WorkQueueDefinitionIdentity: {
                        Id: '',
                        Name: ''
                    },
                    Id: '',
                    Name: '',
                    CategoryIdentity: {},
                    Fields: '',
                    Metadata: '',
                    LastModifiedOn: `/Date(${new Date().valueOf()}+0000)/`
                },
                FieldFilter: {
                    FilterOperator: 0,
                    Filter: []
                },
                JobOwner: {
                    ResourceType: 0
                },
                JobType: 0,
                ReturnPriority: false,
                ReturnAdvancedJobDetails: false,
                ReturnExtraSlaData: false,
                ReturnDueDate: true,
                ReturnTotalJobCount: false,
                OnlyReturnNonArchivedJobs: false,
                ReturnOwnerDetails: false,
                ReturnNullForFinishedTime: false,
                JobViewAccess: false,
                UseJobStatus: true,
                JobStatusFilter: 1,
                UseScoreFilter: true,
                ScoreFilter: {
                    ScoreOperator: 0,
                    Filter: [
                        {
                            Value: '0',
                            Operator: 0
                        }
                    ]
                },
                ReturnScore: true,
                UseJobType: false,
                JobIdsFilter: [],
                SortOptions: [],
                StartTimeFromExpression: '',
                StartTimeToExpression: '',
                FinishTimeFromExpression: '',
                FinishTimeToExpression: '',
                DueDateFromExpression: '',
                DueDateToExpression: '',
                Variables: [
                    {Id: 'SUMMARY_URL', Value: 'location/file.pdf'}
                ],
                UseJobSla: false,
                JobSla: 0,
                CreatorFilter: -1,
                JobOwnerFilter: -1,
                StartTimeType: 3,
                FinishTimeType: 0,
                DueDateFilterType: 0,
                GetQueryResultCount: false,
                ReturnStatePercentage: true
            }
        };

        it('Should call NTLM client successfully.', async () => {
            spy.mockImplementation(() => Promise.resolve('Success'));
            await expect(
                kta.getJob(sessionId, params)
            ).resolves.toBe('Success');
        });

        it('Should fail gracefully.', async () => {
            spy.mockImplementation(() => Promise.reject(new Error('Failure')));
            await expect(
                kta.getJob(sessionId, params)
            ).rejects.toEqual(new Error('Failure'));
        });

        afterAll(() => {
            jest.restoreAllMocks();
        });
    })
});
