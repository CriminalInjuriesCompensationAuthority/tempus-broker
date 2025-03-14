'use strict';

const httpNtlmClient = require('httpntlm');
const getParameter = require('../ssm/index');
const getSecret = require('../secret-manager/index');
const logger = require('../logging/logger');
const cloudWatch = require('../cloudwatch/index');

const client = {
    async sendRequest(serviceUrl, jsonRequest) {
        const ktaArn = await getParameter('kta-secret-arn');
        const ktaSecret = JSON.parse(await getSecret(ktaArn));

        return new Promise(function(resolve, reject) {
            const opts = {
                username: ktaSecret.username,
                password: ktaSecret.password,
                domain: ktaSecret.domain,
                workstation: '',
                url: ktaSecret.sdkPrefix + serviceUrl,
                json: jsonRequest
            };

            const startTime = performance.now(); // Start timer
            logger.info(`Sending request to: ${opts.url}`);

            httpNtlmClient.post(opts, function(err, response) {
                const durationMs = performance.now() - startTime; // Elapsed time in ms

                logger.info(`Response received from: ${opts.url} in ${durationMs.toFixed(3)}ms`);

                if (err) {
                    reject(err);
                } else {
                    cloudWatch.logKTAResponseTime(durationMs, serviceUrl).catch(err => logger.error('Failed to log response time:', err));
                    const parsedResponse = JSON.parse(response.body);
                    if (parsedResponse.Message) {
                        reject(parsedResponse.Message);
                    } else {
                        resolve(parsedResponse.d);
                    }
                }
            });
        });
    }
};

module.exports = client;
