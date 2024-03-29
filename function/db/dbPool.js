'use strict';

const oracledb = require('oracledb');
// TODO: Deprecate the use of "thick" mode
// Toggle between thin and thick mode for dev and deployment
// oracledb.initOracleClient({libDir: '/opt/oracle/instantclient_21_10'});
const getParameter = require('../services/ssm/index');
const getSecret = require('../services/secret-manager/index');
const logger = require('../services/logging/logger');

async function createDBPool() {
    const tariffArn = await getParameter('tariff-secret-arn');

    const tariffSecret = JSON.parse(await getSecret(tariffArn));

    const connectString = `${tariffSecret.host}/${tariffSecret.dbname}`;

    logger.info(`Connecting to Oracle Database on: ${connectString}}`);

    await oracledb.createPool({
        user: tariffSecret.username,
        password: tariffSecret.password,
        connectString,
        poolAlias: 'TempusBrokerPool'
    });
    if (oracledb.getPool('TempusBrokerPool')) {
        return true;
    }
    return false;
}

module.exports = createDBPool;
