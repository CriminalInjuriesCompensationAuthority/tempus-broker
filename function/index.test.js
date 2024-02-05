'use strict';

const oracledb = require('oracledb');
const fs = require('fs');
const {handler, handleTempusBrokerMessage} = require('./index');
const createDBPool = require('./db/dbPool');

async function deleteAnyPreviousTestData() {
    const dbConn = await createDBPool();
    const connection = await oracledb.getConnection('TempusBrokerPool');
    await connection.execute(
        `DELETE FROM ADDRESS_DETAILS WHERE CLAIM_REFERENCE_NUMBER = '327507'`,
        {},
        {autoCommit: true}
    );
    await connection.execute(
        `DELETE FROM APPLICATION_FORM WHERE CLAIM_REFERENCE_NUMBER = '327507'`,
        {},
        {autoCommit: true}
    );

    if (dbConn) {
        await oracledb.getPool('TempusBrokerPool').close(0);
    }
}

describe('Tempus broker function', () => {
    it.skip('Should run the function handler', async () => {
        await deleteAnyPreviousTestData();

        jest.setTimeout(60000);
        const response = await handler({}, null);
        expect(response).toContain('Success!');
    });

    it('Should error if event body contains files with invalid types', async () => {
        const sqsMessage = fs.readFileSync('function/resources/testing/sqsMessage.json');
        const response = handleTempusBrokerMessage(JSON.parse(sqsMessage).Messages[0].Body);
        expect(Object.keys(response)).toContain('applicationJSONDocumentSummaryKey');
        expect(Object.keys(response)).toContain('applicationPDFDocumentSummaryKey');
    });
});
