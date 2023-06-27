# Tempus broker function (Node.js)
This function is set up to run in a lambda environment with the end goals being to insert application data sent by the Datacapture service into Tariff and to trigger a KTA process map.

Key process steps:

- The function is triggered by an SQS event which contains an S3 key for an application PDF and its corresponding JSON data.
- The function will retrieve the JSON from an S3 bucket then create a new JSON object containing a list of key value pairs.
- These key value pairs contain the column_name and the value to insert into tempus.
- Off of this JSON, insert statements are generated for the APPLICATION_FORM and ADDRESS_DETAILS.

The project source includes the following directories:

- `function/index.js` - A Node.js which is triggered by an SQS event.
- `function/db` - Contains methods to create database pools/connections and generate insert statements.
- `resources/testing` - Various sample data used for testing.
- `function/resources/constants` - Constant data used in the mapping and eligibility checking processes.
- `function/services/application-mapper` - Contains logic used in mapping the JSON data to an oracle object.
- `function/services/eligibility-checker` - Contains logic which sets the eligibility (is_eligible column) of the application.
- `function/services/kta` - Supports triggering the KTA process map.
- `function/services/s3` - Supports integration with AWS S3.
- `function/services/secret-manager` - Supports integration with AWS Secrets Manager.
- `function/services/sqs` - Supports integration with AWS SQS.
- `function/services/ssm` - Supports integration with AWS SSM.
- `template.yml` - An AWS CloudFormation template that creates an application.


# Requirements
- [Node.js 14.6 or later with npm](https://nodejs.org/en/download/releases/)
- The Bash shell. For Linux and macOS, this is included by default. In Windows 10, you can install the [Windows Subsystem for Linux](https://docs.microsoft.com/en-us/windows/wsl/install-win10) to get a Windows-integrated version of Ubuntu and Bash.
- [Oracledb for nodejs](https://node-oracledb.readthedocs.io/en/latest/) - Will need to follow step 2.3 onwards to set this up.

Not mandatory but useful if using VSCode:
- Prettier formatter extension
- AWS Toolkit extension

# Local development setup

Download or clone this repository.
Add an .env file containing:

   `NODE_ENV = 'local'`

Configure local code:
- In `function/index.test.js` unskip the `'Should run the function handler'` test
- In `function/db/dbPooljs` and `function/db/index.js` uncomment the lines starting with `oracledb.initOracleClient`
- Comment lines 57 - 66 in `function/index.js`

Configure local AWS environment:
- Create an S3 bucket with a name of your choice
- Create new parameter called `kta-bucket-name` in AWS parameter store with AWS systems manager containing that bucket name.
- Copy contents of `function/resources/check-your-answers-sample.json` into a local document and upload it to S3.
- Ensure the name of the document uploaded aligns with that in `function/resources/event.json`.

- Create new secret in AWS Secret manager containing oracle db data. Contents can be found in confluence under 
  'CICA-CIR -> Secrets - CICA -> Secrets - Tempus -> MRCORCL01 Tariff connection string'
- Create new parameter in AWS parameter store with AWS systems manager containing the ARN of that secret.

- Create an IAM role for the tempus broker with acccess to the created resources.
- If you use the AWS Toolkit extension, you can make a new AWS profile called `tempus-broker-s3` with the secret
  key and access key of the IAM role.

Use `npm run test` to run the function handler locally.

# Test

To run all tests with test coverage, use:
`npx --no-install jest --ci --runInBand --bail --silent --coverage --projects jest.config.js`

To run tests with a debugger attached, use the Run and Debug panel within VS code. The configurations for this can be adjusted in
`.vscode/launch.json`
# Deploy
 
Placeholder

