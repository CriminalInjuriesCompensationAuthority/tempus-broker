'use strict';

const config = {
    testTimeout: 20000
};

process.env.DCS_JWT_SECRET = '9ecc2bd604f91ab4965ab220dd5b03b3175da5b2d85aedd81eb6100a1ba86d41';
process.env.DCS_LOG_LEVEL = 'silent';
process.env.APP_ENV = 'test';

config.coverageThreshold = {
    global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
    }
};

module.exports = config;
