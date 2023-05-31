'use strict';

const oracledb = require('oracledb');

// Comment and uncomment to toggle between thin and thick mode
// oracledb.initOracleClient({libDir: '/opt/oracle/instantclient_21_10'});
const getSecret = require('../services/secret-manager/index');
const logger = require('../services/logging/logger');

// Generates an insert statment for tarriff
function generateInsertStatement(jsonData, table) {
    let columnsList = '';
    let columnsValues = '';
    Object.keys(jsonData).forEach(column => {
        columnsList = `${columnsList + column}, `;
        columnsValues = `${columnsValues}:${column}, `;
    });
    columnsList = columnsList.slice(0, -2);
    columnsValues = columnsValues.slice(0, -2);

    const statement = `INSERT INTO ${table} (${columnsList}) VALUES (${columnsValues})`;

    return statement;
}

async function createDBPool() {
    try {
        await oracledb.createPool({
            user: await getSecret('TARIFF-ORACLE-DEV-USER'),
            password: await getSecret('TARIFF-ORACLE-DEV-PASS'),
            connectString: await getSecret('TARIFF-ORACLE-DEV-CONNECT-STRING'),
            poolAlias: 'TempusBrokerPool'
        });
    } catch (error) {
        logger.error(error);
        throw error;
    }
}

async function insertIntoTempus(jsonData, table) {
    let connection;
    try {
        connection = await oracledb.getConnection('TempusBrokerPool');
        logger.info(jsonData);
        const insertStatement = generateInsertStatement(jsonData, table);
        logger.info(insertStatement);
        await connection.execute(insertStatement, jsonData, {autoCommit: true});
    } catch (error) {
        logger.error(error);
        throw error;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                logger.error(err);
            }
        }
    }
}

module.exports = {createDBPool, insertIntoTempus};
