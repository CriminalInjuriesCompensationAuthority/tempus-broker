'use strict';

const logger = require('../logging/logger');
const KtaNtlmClient = require('./ntlmClient');

/**
 * JobIdentity CreateJob (string sessionId, ProcessIdentity processIdentity, JobInitialization 	jobInitialization)
 * Creates a new instance (a job) for the specified process map.
 * @param sessionId
 * @param processName
 * @param inputVariables
 * Use Version = 0 or -1 for the latest map version, or specify a particular version
 * You cannot apply a start date if you are using a map name. You must specify a process ID to implement a start date. No start date will start the process on completion (applicable in most CICA cases)
 */
async function createJob(sessionId, processName, inputVariables) {
    logger.info('Calling CreateJob via NTLM client');

    const params = {
        sessionId,
        processIdentity: {
            Id: '',
            Name: processName,
            Version: 0
        },
        jobInitialization: {
            InputVariables: inputVariables,
            StartDate: null
        }
    };

    try {
        return await KtaNtlmClient.sendRequest('JobService.svc/json/CreateJob', params);
    } catch (error) {
        logger.error(error);
        throw error;
    }
}

async function getJob(sessionId, queryVariables) {
    logger.info('Calling GetJobsWithQuery2 via NTLM client');

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
            Variables: queryVariables,
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

    try {
        return await KtaNtlmClient.sendRequest('JobService.svc/json/GetJobsWithQuery2', params);
    } catch (error) {
        logger.error(error);
        throw error;
    }
}

module.exports = {createJob, getJob};
