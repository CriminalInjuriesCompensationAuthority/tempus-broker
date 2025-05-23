/* eslint-disable no-console */
// eslint-disable-next-line import/no-extraneous-dependencies
import {$} from 'execa';

// Can remove console.log statements pending the release of: https://github.com/sindresorhus/execa/issues/627
const commandActions = {
    async init() {
        const result = await $`docker run --detach --name localstack -p 4566:4566 -e SERVICES=s3,cloudwatch -e DEFAULT_REGION=eu-west-2 localstack/localstack`;

        console.log(result.stdout);
    },
    async start() {
        const result = await $`docker start localstack`;

        console.log(result.stdout);
    },
    async 'create-bucket'() {
        const result = await $`aws --endpoint-url=http://localhost:4566 s3 mb s3://tempus-broker-bucket`;

        console.log(result.stdout);
    },

    async 'create-cloudwatch-namespace'() {
        const result = await $`aws --endpoint-url=http://localhost:4566 cloudwatch put-metric-data --namespace tempusBrokerFunction/requests --metric-name TestMetric --value 100 --unit Milliseconds`;

        console.log(result.stdout);
    },

    async 'upload-file'() {

        // create new json files representing the data you want to test run this script then run the integration.test.js
         // const result = await $`aws --endpoint-url=http://localhost:4566 s3 cp function/resources/testing/check-your-answers-sample.json s3://tempus-broker-bucket`;
        const result = await $`aws --endpoint-url=http://localhost:4566 s3 cp function/resources/testing/test-eligible-application.json s3://tempus-broker-bucket`;
        const result2 = await $`aws --endpoint-url=http://localhost:4566 s3 ls tempus-broker-bucket`;

        console.log(result.stdout);
        console.log(result2.stdout);
    },
    async 'create-secrets'() {
        // Default test connection values. Update as required.
        const secret = JSON.stringify({
            engine: 'oracle',
            host: 'localhost',
            username: 'foo',
            password: 'abc123',
            dbname: 'FREEPDB1',
            port: 1521
        });

        const result = await $`aws --endpoint-url=http://localhost:4566 secretsmanager create-secret --name tempus-broker-oracle-data --secret-string ${secret}`;

        console.log(result.stdout);
    },
    async 'create-parameters'() {
        const tariffSecretArn = await $`aws --endpoint-url=http://localhost:4566 secretsmanager describe-secret --secret-id tempus-broker-oracle-data --query ARN --output text`;
        const result = await $`aws --endpoint-url=http://localhost:4566 ssm put-parameter --name tariff-secret-arn --value ${tariffSecretArn} --type String`;
        const result2 = await $`aws --endpoint-url=http://localhost:4566 ssm put-parameter --name kta-bucket-name --value tempus-broker-bucket --type String`;

        console.log(tariffSecretArn.stdout);
        console.log(result.stdout);
        console.log(result2.stdout);
    },
    async 'create-queue'() {
        const result = await $`aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name tempus-queue`;

        console.log(result.stdout);
    },
    async 'purge-queue'() {
        const result = await $`aws sqs purge-queue --endpoint-url=http://localhost:4566 --queue-url http://localhost:4566/000000000000/tempus-queue`;

        console.log(result.stdout);
    },
    async 'send-message'() {
        const messageBody = JSON.stringify({
            applicationPDFDocumentSummaryKey: 'sample.pdf',
            applicationJSONDocumentSummaryKey: 'test-eligible-application.json'
        });
        const result = await $`aws --endpoint-url=http://localhost:4566 sqs send-message --queue-url http://localhost:4566/000000000000/tempus-queue --message-body ${messageBody}`;

        console.log(result.stdout);
    }
};
const command = process.argv[2];
const commandAction = commandActions[command];

if (commandAction === undefined) {
    const validCommands = Object.keys(commandActions).join('\n');

    console.error(`Command "${command}" not found. Valid commands are: \n${validCommands}`);
} else {
    await commandAction();
}
