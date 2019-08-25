const os = require('os');
const path = require('path');
const electron = require("electron");
const puppeteer = require("puppeteer-core");
const spawn = require("child_process").spawn;

const userData = path.join(os.tmpdir(), 'hakuneko-test', Date.now().toString(32));
const command = {
    app: electron,
    args: [
        '.',
        '--update-url=DISABLED',
        '--cache-directory=' + path.join('src', 'web'),
        '--user-directory=' + userData,
        '--remote-debugging-port=9200'
    ],
    opts: {
        shell: false
    }
};
const connection = {
    browserURL: "http://localhost:9200",
    defaultViewport: null
};

test('Dummy', () => {});

/*
describe("Puppeteer", () => {

    jest.setTimeout(25000);

    var browser;
    var page;

    beforeAll(async () => {
        //jest.clearAllMocks();
        spawn(command.app, command.args, command.opts);
        browser = await puppeteer.connect(connection);
        [page] = await browser.pages();
    });

    afterAll(async () => {
        await page.close();
        await browser.close();
    });

    beforeEach(async () => {
        await page.reload();
        await page.waitForSelector('hakuneko-app');
    });

    describe('Started', function() {

        it('should have valid window', async () => {
            let title = await page.title();
            expect(title).toEqual('HakuNeko');
            let connectors = await page.evaluate(() => Engine.Connectors.map(connector => connector.label));
            expect(connectors.length > 400).toBeTruthy();

            console.log('Connectors:', connectors);
            let remoteConnectors = await page.evaluateHandle(() => Engine.Connectors);
            console.log('Remote Connectors:', remoteConnectors);
        });

        it('should have available connectors', async () => {
            let connectors = await page.evaluate(() => Engine.Connectors.map(connector => connector.id));
            expect(connectors.length > 400).toBeTruthy();
            expect(connectors.includes('bookmarks')).toBeTruthy();
            expect(connectors.includes('folder_')).toBeTruthy();
            expect(connectors.includes('mangadex')).toBeTruthy();

            let remoteConnectors = await page.evaluateHandle(() => Engine.Connectors);
            console.log('Remote Connectors:', remoteConnectors);
        });
    });
});
*/