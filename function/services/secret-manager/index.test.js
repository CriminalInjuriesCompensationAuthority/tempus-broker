'use strict';

const {mockClient} = require('aws-sdk-client-mock');
const {SecretsManagerClient, GetSecretValueCommand} = require('@aws-sdk/client-secrets-manager');
const getSecret = require('.');

describe('Secret Manager service', () => {
    it('Should retrieve secrets from a given arn', async () => {
        const mockSSMClient = mockClient(SecretsManagerClient);
        mockSSMClient.on(GetSecretValueCommand).resolves({
            SecretString: 'test'
        });
        const param = await getSecret('tempus-broker-test');
        expect(param).toContain('test');
    });
});
