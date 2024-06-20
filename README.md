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
- [Node.js 18.16.1 or later with npm](https://nodejs.org/en/download/releases/)
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- [Oracledb for nodejs](https://node-oracledb.readthedocs.io/en/latest/) - **(This step is only required if connecting to Oracle < 12.1, which is not supported in [thin mode](https://node-oracledb.readthedocs.io/en/latest/user_guide/appendix_a.html))** Will need to follow step 2.3 onwards to set this up. Select the latest version, at least Version 21_10 required. The function/db/dbPool.js and function/db/index.js files will need updating accordingly.
- An Oracle DB instance e.g. https://www.oracle.com/uk/database/free/. An instance is available as part of our local development environment.

Not mandatory but useful if using VSCode:
- Prettier formatter extension
- AWS Toolkit extension

# Local development setup

Download or clone this repository.
Add an .env file containing:

   ```
   NODE_ENV = 'local'
   TEMPUS_QUEUE='http://localhost:4566/000000000000/tempus-queue'
   ```

Configure local code:
- In `function/index.test.js` unskip the `'Should run the function handler'` test
- **(This step is only required if connecting to Oracle < 12.1, which is not supported in [thin mode](https://node-oracledb.readthedocs.io/en/latest/user_guide/appendix_a.html))** In `db/index.js` and `db/dbPool.js` uncomment the lines starting with `oracledb.init`. 

Configure local AWS environment:

The tempus broker uses localstack for easy setup of AWS services and resources. The setup can be found in the Makefile of this directory.

In the Makefile.mjs `create-secrets` job, you will need update the connection details as required. The defaults will work with the DB instance provided by the local development environment.

Once this is done, open this project directory in terminal and run:
 - `node Makefile.mjs init`
 - `node Makefile.mjs start`
 - `node Makefile.mjs create-bucket`
 - `node Makefile.mjs upload-file`
 - `node Makefile.mjs create-secrets`
 - `node Makefile.mjs create-parameters`
 - `node Makefile.mjs create-queue`

To check the localstack container is running, you can run `docker ps`

Use `npm run test` to run the function handler locally.

The lambda function polls the queue that was created, so in order for it to pick up anything to process, ensure it contains a valid message. A message can be sent using `node Makefile.mjs send-message` once the queue has been created.

# Test
To run all tests with test coverage, use:
`npx --no-install jest --ci --runInBand --bail --silent --coverage --projects jest.config.js`

To run tests with a debugger attached, use the Run and Debug panel within VS code. The configurations for this can be adjusted in
`.vscode/launch.json`
# Deploy
 
Placeholder

TEST!!
