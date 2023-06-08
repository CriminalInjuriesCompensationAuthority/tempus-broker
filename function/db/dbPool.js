'use strict';

const oracledb = require('oracledb');
// Comment and uncomment to toggle between thin and thick mode
// oracledb.initOracleClient({libDir: '/opt/oracle/instantclient_21_10'});
const getParameter = require('../services/ssm/index');
const getSecret = require('../services/secret-manager/index');

async function createDBPool() {
    const tariffArn = await getParameter('tariff-secret-arn');
    const tariffSecret = JSON.parse(await getSecret(tariffArn));
    const connectString = `${tariffSecret.host}/${tariffSecret.dbname}`;
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
