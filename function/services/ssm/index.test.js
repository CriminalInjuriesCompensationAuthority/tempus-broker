'use strict';

const {mockClient} = require('aws-sdk-client-mock');
const {SSMClient, GetParameterCommand} = require('@aws-sdk/client-ssm');
const getParameter = require('.');

describe('SSM service', () => {
    it('Should retrieve secrets from a given secret name', async () => {
        const mockSSMClient = mockClient(SSMClient);
        mockSSMClient.on(GetParameterCommand).resolves({
            Parameter: {
                Value: 'test'
            }
        });
        const param = await getParameter('tempus-broker-test');
        expect(param).toContain('test');
    });
});
