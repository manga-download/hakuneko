const assert = require('assert');
const Configuration = require('../src/Configuration.js');

new Configuration(undefined).printInfo();

describe('Configuration', function() {

    describe('publicKey', function() {

        it('must be valid', () => {
            let testee = new Configuration(undefined);
            assert.equal(testee.publicKey.startsWith('-----BEGIN PUBLIC KEY-----'), true);
            assert.equal(testee.publicKey.endsWith('-----END PUBLIC KEY-----'), true);
            assert.equal(testee.publicKey.length, 450);
            assert.equal(testee.publicKey.includes('owIDAQAB'), true);
        });
    });
});