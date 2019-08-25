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

        it('should have visible window', async () => {
            let title = await page.title();
            expect(title).toEqual('HakuNeko');
            /*
             *await page.waitForSelector("#demo");
             *const text = await page.$eval("#demo", e => e.innerText);
             *expect(text).toBe("Demo of Electron + Puppeteer + Jest.");
             */
        });
    });
});