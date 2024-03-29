'use strict';

const oracledb = require('oracledb');
// TODO: Deprecate the use of "thick" mode
// Toggle between thin and thick mode for dev and deployment
// oracledb.initOracleClient({libDir: '/opt/oracle/instantclient_21_10'});

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

async function insertIntoTempus(jsonData, table) {
    let connection;
    try {
        connection = await oracledb.getConnection('TempusBrokerPool');
        // Handle multiple address details insert statements
        if (Array.isArray(jsonData)) {
            jsonData.forEach(async addressDetailEntry => {
                const insertStatement = generateInsertStatement(addressDetailEntry, table);
                logger.info(insertStatement);
                try {
                    await connection.execute(insertStatement, addressDetailEntry, {
                        autoCommit: true
                    });
                } catch (err) {
                    if (err?.code === 'ORA-00001') {
                        logger.error(`Address details were already inserted into tariff: ${err}`);
                    } else {
                        throw err;
                    }
                }
            });
        } else {
            const insertStatement = generateInsertStatement(jsonData, table);
            logger.info(insertStatement);
            try {
                await connection.execute(insertStatement, jsonData, {autoCommit: true});
            } catch (err) {
                if (err?.code === 'ORA-00001') {
                    logger.error(`Application form was already inserted into tariff: ${err}`);
                } else {
                    throw err;
                }
            }
        }
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

module.exports = insertIntoTempus;
