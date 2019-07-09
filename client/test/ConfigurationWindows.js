const assert = require('assert');
const { FileLogger } = require('logtrine');
const ConfigurationWindows = require('../src/ConfigurationWindows.js');
var logger = new FileLogger('test/ConfigurationWindows.log', FileLogger.LEVEL.All);

new ConfigurationWindows(undefined, logger).printInfo();

describe('ConfigurationWindows', function() {

    describe('publicKey', function() {

        it('must be valid', () => {
            let testee = new ConfigurationWindows(undefined, logger);
            assert.equal(testee.publicKey.startsWith('-----BEGIN PUBLIC KEY-----'), true);
            assert.equal(testee.publicKey.endsWith('-----END PUBLIC KEY-----'), true);
            assert.equal(testee.publicKey.length, 450);
            assert.equal(testee.publicKey.includes('owIDAQAB'), true);
        });
    });
});