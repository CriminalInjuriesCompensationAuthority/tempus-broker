'use strict';

const oracledb = require('oracledb');
const createDBPool = require('./dbPool');

describe('Database Pool', () => {
    let createPoolSpy;
    let getPoolSpy;

    beforeAll(() => {
        createPoolSpy = jest.fn();
        getPoolSpy = jest.fn();

        createPoolSpy = jest.spyOn(oracledb, 'createPool');
        getPoolSpy = jest.spyOn(oracledb, 'getPool');
    });

    it('Should create a database pool and return true', async () => {
        createPoolSpy.mockImplementation(() => 'test');
        getPoolSpy.mockImplementation(() => true);
        const response = await createDBPool();
        expect(response).toBeTruthy();
    });

    it('Should return false if there was no db pool created', async () => {
        createPoolSpy.mockImplementation(() => 'test');
        getPoolSpy.mockImplementation(() => false);
        const response = await createDBPool();
        expect(response).toBeFalsy();
    });
});
