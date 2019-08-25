const os = require('os');
const path = require('path');
const electron = require("electron");
const Application = require('spectron').Application;

//const userData = path.join(os.tmpdir(), 'hakuneko-test', Date.now().toString(32));
// assuming the project's root directory is the current working directory for e2e tests
var command = {
    path: electron,
    args: [
        '.',
        '--update-url=DISABLED',
        `--cache-directory=${path.join('src', 'web')}`//,
        //'--user-directory=' + userData
    ]
};

describe('Spectron', () => {

    jest.setTimeout(25000);

    var browser = new Application(command);

    beforeAll(async () => {
        //jest.clearAllMocks();
        await browser.start();
    });

    afterAll(async () => {
        await browser.stop();
    });

    describe('Started', function() {

        it('should have visible window', async () => {
            //await browser.client.waitUntilWindowLoaded();
            expect(await browser.browserWindow.isVisible()).toBeTruthy();
            expect(await browser.client.getTitle()).toEqual('HakuNeko');
        });
    });
});