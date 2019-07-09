const assert = require('assert');
const { FileLogger } = require('logtrine');
const Configuration = require('../src/Configuration.js');
var logger = new FileLogger('test/Configuration.log', FileLogger.LEVEL.All);

new Configuration(undefined, logger).printInfo();

describe('Configuration', function() {

    describe('publicKey', function() {

        it('must be valid', () => {
            let testee = new Configuration(undefined, logger);
            assert.equal(testee.publicKey.startsWith('-----BEGIN PUBLIC KEY-----'), true);
            assert.equal(testee.publicKey.endsWith('-----END PUBLIC KEY-----'), true);
            assert.equal(testee.publicKey.length, 450);
            assert.equal(testee.publicKey.includes('owIDAQAB'), true);
        });
    });
});