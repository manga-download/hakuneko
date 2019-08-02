const assert = require('assert');
const { FileLogger } = require('logtrine');
const App = require('../../src/app/App.js');
var logger = new FileLogger(__filename + '.log', FileLogger.LEVEL.All);
logger.clear();

describe('App', function() {

    describe('run', function() {

        it('no error', () => {
            let testee = new App(logger);
            //testee.run();
        });
    });

    describe('MOCK TEST', function() {

        it.skip('must skip', () => {
            //
        });

        xit('must ignore', () => {
            //
        });

        it('must fail', () => {
            throw new Error('Not Implemented');
        });
    });

});