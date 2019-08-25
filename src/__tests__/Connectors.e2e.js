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

describe("HakuNeko Engine", () => {

    jest.setTimeout(25000);

    var browser;
    var page;

    beforeAll(async () => {
        //jest.clearAllMocks();
        spawn(command.app, command.args, command.opts);
        await new Promise(resolve => setTimeout(resolve, 5000));
        browser = await puppeteer.connect(connection);
        [page] = await browser.pages();
    });

    afterAll(async () => {
        await page.close();
        await browser.close();
    });

    beforeEach(async () => {
        // TODO: cleanup user data directory?
        await page.reload();
        await page.waitForSelector('hakuneko-app');
    });

    describe('Connectors', function() {

        it('should support MangaDex', async () => {
            // get connector for website as reference to the remote instance
            let remoteConnector = await page.evaluateHandle(() => Engine.Connectors.find(connector => connector.id === 'mangadex'));
            expect(remoteConnector._remoteObject.className).toEqual('MangaDex');
            // get manga for website as reference to the remote instance
            let remoteManga = await page.evaluateHandle(connector => {
                return connector.getMangaFromURI(new URL('https://mangadex.org/title/20164/they-say-i-was-born-a-king-s-daughter'));
            }, remoteConnector);
            expect(remoteManga._remoteObject.className).toEqual('Manga');
            // get chapters for manga as reference to the remote instance
            let remoteChapters = await page.evaluateHandle(manga => {
                return new Promise( resolve => {
                    manga.getChapters((_, chapters) => resolve(chapters));
                });
            }, remoteManga);
            expect(remoteChapters._remoteObject.className).toEqual('Array');
            // get first chapter for chapters as reference to the remote instance
            let remoteChapter = await page.evaluateHandle(chapters => {
                return chapters.shift();
            }, remoteChapters);
            expect(remoteChapter._remoteObject.className).toEqual('Chapter');
            // get pages for chapter as reference to the remote instance
            let pages = await page.evaluate(chapter => {
                return new Promise( resolve => {
                    chapter.getPages((_, pages) => resolve(pages));
                });
            }, remoteChapter);
            expect(pages.length).toEqual(51);
            pages.forEach(page => expect(page).toMatch(/^https:\/\/s1.mangadex.org\/data\/[0-9a-f]{32}\/R\d+\.jpg$/));
        });
    });
});