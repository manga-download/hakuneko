const assert = require('assert');
const ConfigurationWindows = require('../src/ConfigurationWindows.js');

new ConfigurationWindows(undefined).printInfo();

describe('ConfigurationWindows', function() {

    describe('publicKey', function() {

        it('must be valid', () => {
            let testee = new ConfigurationWindows(undefined);
            assert.equal(testee.publicKey.startsWith('-----BEGIN PUBLIC KEY-----'), true);
            assert.equal(testee.publicKey.endsWith('-----END PUBLIC KEY-----'), true);
            assert.equal(testee.publicKey.length, 450);
            assert.equal(testee.publicKey.includes('owIDAQAB'), true);
        });
    });
});