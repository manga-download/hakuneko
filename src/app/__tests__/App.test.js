const App = require('../App.js');
const Configuration = require('../Configuration');
const ConfigurationLinux = require('../ConfigurationLinux');
const ConfigurationDarwin = require('../ConfigurationDarwin');
const ConfigurationWindows = require('../ConfigurationWindows');
const { FileLogger } = require('@logtrine/logtrine');
var logger = new FileLogger(__filename + '.log', FileLogger.LEVEL.All);
logger.clear();

jest.mock('fs-extra');
const fs = require('fs-extra');

jest.mock('electron', () => {
    return {
        app: {
            getAppPath: jest.fn(() => '/usr/bin'),
            getPath: jest.fn(type => {
                switch(type) {
                    case 'exe': return '/usr/bin/hakuneko';
                    case 'appData': return 'data';
                    case 'userData': return 'data/hakuneko';
                    case 'userCache': return 'cache/hakuneko';
                    default: return undefined;
                }
            }),
            getName: jest.fn(() => 'HakuNeko')
        }
    };
});

describe('App', function() {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        //
    });

    describe('_configuration', function() {

        it('should return default configuration when in portable mode', () => {
            fs.existsSync.mockReturnValueOnce(true);
            let testee = new App(logger);
            expect(testee._configuration instanceof Configuration).toBeTruthy();
            expect(testee._configuration instanceof ConfigurationWindows).toBeFalsy();
            expect(testee._configuration instanceof ConfigurationDarwin).toBeFalsy();
            expect(testee._configuration instanceof ConfigurationLinux).toBeFalsy();
        });
        it('should return platform specific configuration', () => {
            fs.existsSync.mockReturnValueOnce(false);
            let testee = new App(logger);
            if(process.platform === 'linux') {
                expect(testee._configuration instanceof ConfigurationLinux).toBeTruthy();
            }
            if(process.platform === 'darwin') {
                expect(testee._configuration instanceof ConfigurationDarwin).toBeTruthy();
            }
            if(process.platform === 'win32') {
                expect(testee._configuration instanceof ConfigurationWindows).toBeTruthy();
            }

        });
    });
});