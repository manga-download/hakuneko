const assert = require('assert');
const { FileLogger } = require('logtrine');
const App = require('../src/App.js');
var logger = new FileLogger('test/App.log', FileLogger.LEVEL.All);
logger.clear();

describe('App', function() {

    describe('run', function() {

        it('no error', () => {
            let testee = new App(logger);
            testee.run();
        });
    });

});