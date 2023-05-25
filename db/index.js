'use strict';

const oracledb = require('oracledb');

oracledb.initOracleClient({libDir: '/opt/oracle/instantclient_21_10'});
const getSecret = require('../services/secret-manager/index');
const logger = require('../services/logging/logger');

// Generates an insert statment for tarriff
function generateInsertStatement(jsonObject, table) {
    let columnsList = '';
    let columnsValues = '';
    Object.keys(jsonObject).forEach(column => {
        columnsList = `${columnsList + column}, `;
        columnsValues = `${columnsValues}:${column}, `;
    });
    columnsList = columnsList.slice(0, -2);
    columnsValues = columnsValues.slice(0, -2);

    const statement = `INSERT INTO ${table} (${columnsList}) VALUES (${columnsValues})`;

    return statement;
}

async function createDBConnection(oracleObject) {
    let connection;
    try {
        connection = await oracledb.getConnection({
            user: await getSecret('TARIFF-ORACLE-DEV-USER'),
            password: await getSecret('TARIFF-ORACLE-DEV-PASS'),
            connectString: await getSecret('TARIFF-ORACLE-DEV-CONNECT-STRING')
        });

        const applicationFormJson = Object.values(oracleObject)[0][0].APPLICATION_FORM;
        const addressDetailsJson = Object.values(oracleObject)[0][1].ADDRESS_DETAILS;

        const formInsertStatement = generateInsertStatement(
            applicationFormJson,
            'APPLICATION_FORM'
        );
        const addressInsertStatement = generateInsertStatement(
            addressDetailsJson,
            'ADDRESS_DETAILS'
        );
        logger.info(formInsertStatement);
        logger.info(addressInsertStatement);

        await connection.execute(formInsertStatement, applicationFormJson, {autoCommit: true});
        await connection.execute(addressInsertStatement, addressDetailsJson, {autoCommit: true});
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

module.exports = createDBConnection;
