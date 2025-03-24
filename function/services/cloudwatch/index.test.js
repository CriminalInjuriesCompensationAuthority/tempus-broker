'use strict';

const {mockClient} = require('aws-sdk-client-mock');
const { CloudWatchClient, PutMetricDataCommand } = require('@aws-sdk/client-cloudwatch');
const cw = require('.');

describe('CloudWatch Metrics Logging', () => {
    const mockCWClient = mockClient(CloudWatchClient);

    beforeAll(() => {
        mockCWClient.reset();
    });

    it('should send a PutMetricDataCommand to CloudWatch', async () => {
        const testUrl = 'http://testUrl';
        const testDuration = 100;
        const mockCommand = {
            MetricData: [
                {
                    MetricName: "ktaRequestLatency",
                    Dimensions: [{ Name: "ktaRequestUrl", Value: testUrl }],
                    Value: testDuration,
                    Unit: "Milliseconds"
                },
            ],
            Namespace: 'tempusBrokerFunction/requests',
        };
        mockCWClient.on(PutMetricDataCommand, mockCommand).resolves({
            "Metrics": [
                {
                    "Namespace": "tempusBrokerFunction/requests",
                    "MetricName": "ktaRequestLatency"
                }
            ]
        });

        const response = await cw.logKTALatency(testDuration, testUrl);
        expect(response.Metrics[0]).toEqual(
            {
                "Namespace": "tempusBrokerFunction/requests",
                "MetricName": "ktaRequestLatency"
            }
        );
    });

    it('should log an error if CloudWatch request fails', async () => {
        const testUrl = 'http://testUrl';
        const testDuration = 100;
        const mockCommand = {
            MetricData: [
                {
                    MetricName: "ktaRequestLatency",
                    Dimensions: [{ Name: "ktaRequestUrl", Value: testUrl }],
                    Value: testDuration,
                    Unit: "Milliseconds"
                },
            ],
            Namespace: 'tempusBrokerFunction/requests',
        };
        mockCWClient.on(PutMetricDataCommand, mockCommand).rejects('Cloud Watch is unavailable.');

        await expect(async () =>
            await cw.logKTALatency(testDuration, testUrl)
        ).rejects.toThrowError('Cloud Watch is unavailable.');
    });
});
