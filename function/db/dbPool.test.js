'use strict';

const {mockClient} = require('aws-sdk-client-mock');
const {SecretsManagerClient, GetSecretValueCommand} = require('@aws-sdk/client-secrets-manager');
const {SSMClient, GetParameterCommand} = require('@aws-sdk/client-ssm');
const oracledb = require('oracledb');
const createDBPool = require('./dbPool');

jest.mock('oracledb', () => {
    return {
        createPool: jest.fn(() => {
            return true;
        }),
        getPool: jest.fn(),
        initOracleClient: jest.fn(() => {
            return true;
        })
    };
});

describe('Database Pool', () => {
    beforeAll(async () => {
        const mockSSMClient = mockClient(SSMClient);
        const mockSecretsManagerClient = mockClient(SecretsManagerClient);

        mockSSMClient.on(GetParameterCommand).resolves({
            Parameter: {
                Value: 'arn'
            }
        });
        mockSecretsManagerClient.on(GetSecretValueCommand).resolves({
            SecretString: JSON.stringify({
                username: 'test',
                password: 'test'
            })
        });
    });
    it('Should create a database pool and return true', async () => {
        oracledb.getPool.mockReturnValueOnce(true);
        const response = await createDBPool();
        expect(response).toBeTruthy();
    });

    it('Should return false if there was no db pool created', async () => {
        oracledb.getPool.mockReturnValueOnce(false);
        const response = await createDBPool();
        expect(response).toBeFalsy();
    });
});
