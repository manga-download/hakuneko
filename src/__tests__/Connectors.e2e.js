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

async function assertConnector(browserPage, parameters, expectations) {

    // or use an all in one method that runs fully in renderer scope?

    // get connector for website as reference to the remote instance
    let remoteConnector = await browserPage.evaluateHandle(connectorID => {
        return Engine.Connectors.find(connector => connector.id === connectorID);
    }, parameters.connectorID);
    expect(remoteConnector._remoteObject.className).toEqual(expectations.connectorClass);

    // get manga for website as reference to the remote instance
    let remoteManga = await browserPage.evaluateHandle((connector, mangaURL) => {
        return connector.getMangaFromURI(new URL(mangaURL));
    }, remoteConnector, parameters.mangaURL);
    expect(remoteManga._remoteObject.className).toEqual('Manga');

    // get chapters for manga as reference to the remote instance
    let remoteChapters = await browserPage.evaluateHandle(manga => {
        return new Promise( resolve => {
            manga.getChapters((_, chapters) => resolve(chapters));
        });
    }, remoteManga);
    expect(remoteChapters._remoteObject.className).toEqual('Array');

    // get first chapter for chapters as reference to the remote instance
    let remoteChapter = await browserPage.evaluateHandle((chapters, chaptersMethod) => {
        // first => shift, last => pop, INT => getAtIndex
        return chapters[chaptersMethod]();
    }, remoteChapters, parameters.chaptersMethod);
    expect(remoteChapter._remoteObject.className).toEqual('Chapter');

    // get pages for chapter as reference to the remote instance
    let pages = await browserPage.evaluate(chapter => {
        return new Promise(resolve => {
            chapter.getPages((_, pages) => resolve(pages));
        });
    }, remoteChapter);
    expect(pages.length).toEqual(expectations.pageCount);
    pages.forEach(page => expect(page).toMatch(expectations.pageMatcher));
}

describe("HakuNeko Engine", () => {

    jest.setTimeout(25000);

    var process;
    var browser;
    var page;

    // SetUp
    beforeAll(async () => {
        //jest.clearAllMocks();
        process = spawn(command.app, command.args, command.opts);
        await new Promise(resolve => setTimeout(resolve, 7500));
        browser = await puppeteer.connect(connection);
        [page] = await browser.pages();
    });

    // TearDown
    afterAll(async () => {
        try {
            await page.close();
            await browser.close();
        } catch(error) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            process.kill();
        }
    });

    beforeEach(async () => {
        // TODO: cleanup user data directory?
        await page.reload();
        await page.waitForSelector('hakuneko-app');
    });

    describe('Connectors', function() {

        it('should support MangaDex', async () => {
            await assertConnector(page, {
                connectorID: 'mangadex',
                mangaURL: 'https://mangadex.org/title/20164/they-say-i-was-born-a-king-s-daughter',
                chaptersMethod: 'shift' // first => shift, last => pop
            }, {
                connectorClass: 'MangaDex',
                mangaTitle: '',
                chapterTitle: '',
                pageCount: 51,
                pageMatcher: /^https:\/\/s\d+.mangadex.org\/data\/[0-9a-f]{32}\/R\d+\.jpg$/
            });
        });
    });
});