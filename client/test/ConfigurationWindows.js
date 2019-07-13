const path = require('path');
const fs = require('fs-extra');
const assert = require('assert');
const ConfigurationWindows = require('../src/ConfigurationWindows.js');

new ConfigurationWindows(undefined).printInfo();

describe('ConfigurationWindows', function() {

    describe('defaults must be valid', function() {

        let testee = new ConfigurationWindows(undefined);

        it('isPortableMode', () => {
            let file = process.execPath + '.portable';
            fs.createFileSync(file);
            assert.equal(ConfigurationWindows.isPortableMode, true);
            fs.unlinkSync(file);
            assert.equal(ConfigurationWindows.isPortableMode, false);
        });

        it('publicKey', () => {
            assert.equal(testee.publicKey.startsWith('-----BEGIN PUBLIC KEY-----'), true);
            assert.equal(testee.publicKey.endsWith('-----END PUBLIC KEY-----'), true);
            assert.equal(testee.publicKey.includes('owIDAQAB'), true);
            assert.equal(testee.publicKey.length, 450);
        });

        it('applicationProtocol', () => {
            assert.equal(testee.applicationProtocol, 'cache');
        });

        it('applicationUpdateURL', () => {
            assert.equal(testee.applicationUpdateURL, 'http://static.hakuneko.download/5.0/latest');
        });

        it('connectorProtocol', () => {
            assert.equal(testee.connectorProtocol, 'connector');
        });

        it('applicationStartupURL', () => {
            assert.equal(testee.applicationStartupURL, 'cache://hakuneko/index.html');
        });

        (process.platform === 'win32' ? it : it.skip)('applicationCacheDirectory', () => {
            assert.equal(testee.applicationCacheDirectory, path.join(process.env.HOME, 'AppData', 'Local', 'Electron', 'cache'));
        });

        (process.platform === 'win32' ? it : it.skip)('applicationUserDataDirectory', () => {
            // NOTE: This fails, because the temporary mocha path is detected
            assert.equal(testee.applicationUserDataDirectory, path.join(process.env.HOME, 'AppData', 'Roaming', 'Electron'));
        });
    });

    describe('must accept supported options', function() {

        let expected = {
            publicKey: 'publicKey',
            applicationProtocol: 'applicationProtocol',
            applicationUpdateURL: 'applicationUpdateURL',
            connectorProtocol: 'connectorProtocol',
            applicationStartupURL: 'protocol://applicationStartupURL',
            applicationCacheDirectory: 'applicationCacheDirectory',
            applicationUserDataDirectory: 'applicationUserDataDirectory'
        };
        let testee = new ConfigurationWindows(expected);

        it('publicKey', () => {
            assert.notEqual(testee.publicKey, expected.publicKey);
        });

        it('applicationProtocol', () => {
            assert.equal(testee.applicationProtocol, expected.applicationStartupURL.split(':')[0]);
        });

        it('applicationUpdateURL', () => {
            assert.equal(testee.applicationUpdateURL, expected.applicationUpdateURL);
        });

        it('connectorProtocol', () => {
            assert.notEqual(testee.connectorProtocol, expected.connectorProtocol);
        });

        it('applicationStartupURL', () => {
            assert.equal(testee.applicationStartupURL, expected.applicationStartupURL);
        });

        it('applicationCacheDirectory', () => {
            assert.equal(testee.applicationCacheDirectory.endsWith(expected.applicationCacheDirectory), true);
        });

        it('applicationUserDataDirectory', () => {
            assert.equal(testee.applicationUserDataDirectory.endsWith(expected.applicationUserDataDirectory), true);
        });
    });
});