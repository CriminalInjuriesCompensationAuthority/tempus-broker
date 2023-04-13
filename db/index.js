'use strict';

function createDBQuery(spec) {
    const {logger} = spec;

    // TODO: Integrate with ORACLE

    // // https://node-postgres.com/guides/project-structure
    // async function query(text, params) {
    //     const hrstart = process.hrtime();
    //     const results = await pool.query(text, params);
    //     const hrend = process.hrtime(hrstart);
    //     const executionTime = {
    //         seconds: hrend[0],
    //         milliseconds: hrend[1] / 1000000
    //     };
    //     const duration = `${executionTime.seconds}s ${executionTime.milliseconds}ms`;

    //     logger.info(
    //         {query: {text, duration, executionTime, rows: results.rowCount}},
    //         'DB QUERY EXECUTED'
    //     );

    //     return results;
    // }

    // return Object.freeze({
    //     query
    // });
}

module.exports = createDBQuery;
