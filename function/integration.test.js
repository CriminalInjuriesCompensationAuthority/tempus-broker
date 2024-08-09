'use strict';

const oracledb = require('oracledb');

const {handler} = require('./index');
const createDBPool = require('./db/dbPool');

// see the README for more information
// essentially this is an integration test requiring other steps to be performed
// this is not the best way to approach this but leaving for now.
async function deleteAnyPreviousTestData() {
    const dbConn = await createDBPool();
    const connection = await oracledb.getConnection('TempusBrokerPool');
    await connection.execute(
        `DELETE FROM ADDRESS_DETAILS WHERE CLAIM_REFERENCE_NUMBER in ('327507', '756458')`,
        {},
        {autoCommit: true}
    );
    await connection.execute(
        `DELETE FROM APPLICATION_FORM WHERE CLAIM_REFERENCE_NUMBER in ('327507', '756458')`,
        {},
        {autoCommit: true}
    );

    if (dbConn) {
        await oracledb.getPool('TempusBrokerPool').close(0);
    }
}

describe('Tempus broker function', () => {
    // see the README for more information
    it('Should run the function handler', async () => {
        await deleteAnyPreviousTestData();

        jest.setTimeout(60000);
        const response = await handler({}, null);
        expect(response).toContain('Success!');
    });   
});
