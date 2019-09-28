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

    // get connector for website as reference to the remote instance
    let remoteConnector = await browserPage.evaluateHandle(connectorID => {
        return Engine.Connectors.find(connector => connector.id === connectorID);
    }, parameters.connectorID);
    expect(await browserPage.evaluate(o => o.constructor.name, remoteConnector)).toEqual(expectations.connectorClass);

    // get manga for website as reference to the remote instance
    let remoteManga = await browserPage.evaluateHandle((connector, mangaURL) => {
        return connector.getMangaFromURI(new URL(mangaURL));
    }, remoteConnector, parameters.mangaURL);
    expect(await browserPage.evaluate(o => o.constructor.name, remoteManga)).toEqual('Manga');
    let remoteMangaID = await (await remoteManga.getProperty('id')).jsonValue();
    let remoteMangaTitle = await (await remoteManga.getProperty('title')).jsonValue();
    expect(remoteMangaID).toEqual(expectations.mangaID);
    expect(remoteMangaTitle).toEqual(expectations.mangaTitle);

    // get chapters for manga as reference to the remote instance
    let remoteChapters = await browserPage.evaluateHandle(manga => {
        return new Promise( resolve => {
            manga.getChapters((_, chapters) => resolve(chapters));
        });
    }, remoteManga);
    expect(remoteChapters._remoteObject.className).toEqual('Array');

    // get first chapter for chapters as reference to the remote instance
    let remoteChapter = await browserPage.evaluateHandle((chapters, chaptersAccessor) => {
        // first => shift, last => pop, INT => getAtIndex
        return Number.isInteger(chaptersAccessor) ? chapters[chaptersAccessor] : chapters[chaptersAccessor]();
    }, remoteChapters, parameters.chaptersAccessor);
    expect(await browserPage.evaluate(o => o.constructor.name, remoteChapter)).toEqual('Chapter');
    let remoteChapterID = await (await remoteChapter.getProperty('id')).jsonValue();
    let remoteChapterTitle = await (await remoteChapter.getProperty('title')).jsonValue();
    expect(remoteChapterID).toEqual(expectations.chapterID);
    expect(remoteChapterTitle).toEqual(expectations.chapterTitle);

    // get pages for chapter as reference to the remote instance
    let pages = await browserPage.evaluate(chapter => {
        return new Promise(resolve => {
            chapter.getPages((_, pages) => resolve(pages));
        });
    }, remoteChapter);
    expect(pages.length).toEqual(expectations.pageCount);
    pages = pages.map(page => {
        if(page.startsWith('connector://' + parameters.connectorID)) {
            let payload = decodeURIComponent(page.split('payload=')[1]);
            payload = JSON.parse(Buffer.from(payload, 'base64').toString());
            return payload.url;
        } else {
            return page;
        }
    });
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
        process.stdout.on('data', (data) => {
            console.log(`hakuneko [stdout]: ${data}`);
        });
        process.stderr.on('data', (data) => {
            console.error(`hakuneko [stderr]: ${data}`);
        });
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

    describe('Connectors', () => {

        describe('Clipboard', () => {
            //
        });

        describe('MangaDex', () => {
            it('should get manga, chapters and page links', async () => {
                await assertConnector(page, {
                    connectorID: 'mangadex',
                    mangaURL: 'https://mangadex.org/title/20164/they-say-i-was-born-a-king-s-daughter',
                    chaptersAccessor: 0 // first => shift, last => pop, index => Integer
                }, {
                    connectorClass: 'MangaDex',
                    mangaID: '20164',
                    mangaTitle: 'They Say I Was Born a King\'s Daughter',
                    chapterID: '534370',
                    chapterTitle: 'Ch.0001 (br) [Usagi Scan]',
                    pageCount: 51,
                    pageMatcher: /^https:\/\/s\d+.mangadex.org\/data\/[0-9a-f]{32}\/R\d+\.jpg$/
                });
            });
        });

        describe('KissManga', () => {
            it('should get manga, chapters and page links', async () => {
                await assertConnector(page, {
                    connectorID: 'kissmanga',
                    mangaURL: 'https://kissmanga.com/Manga/Black-Clover',
                    chaptersAccessor: 'pop' // first => shift, last => pop, index => Integer
                }, {
                    connectorClass: 'KissManga',
                    mangaID: '/Manga/Black-Clover',
                    mangaTitle: 'Black Clover',
                    chapterID: '/Manga/Black-Clover/Chapter-001?id=277498',
                    chapterTitle: '001',
                    pageCount: 50,
                    pageMatcher: /^http:\/\/2\.bp\.blogspot\.com\/-[a-zA-Z0-9_-]{11}\/Vjv[a-zA-Z0-9_-]{7}I\/AAAAAAAE[a-zA-Z0-9]{3}\/[a-zA-Z0-9_-]{11}\/s16000\/0001-0\d{2}.jpg$/
                });
            });
        });

        describe('MangaGo', () => {
            it('should get manga, chapters and page links', async () => {
                await assertConnector(page, {
                    connectorID: 'mangago',
                    mangaURL: 'http://www.mangago.me/read-manga/black_clover/',
                    chaptersAccessor: 'pop' // first => shift, last => pop, index => Integer
                }, {
                    connectorClass: 'MangaGo',
                    mangaID: '/read-manga/black_clover/',
                    mangaTitle: 'Black Clover',
                    chapterID: '/read-manga/black_clover/bt/314637/Ch1/',
                    chapterTitle: 'Ch.1  : The Boy\'s Vow',
                    pageCount: 51,
                    pageMatcher: /^http:\/\/iweb\d.mangapicgallery.com\/r\/newpiclink\/black_clover\/1\/[a-z0-9]{32}\.(?:png|jpg|jpeg)$/
                });
            });
        });

        describe('EpikManga', () => {
            it('should get manga, chapters and page links', async () => {
                await assertConnector(page, {
                    connectorID: 'epikmanga',
                    mangaURL: 'https://www.epikmanga.com/seri/battle-through-the-heavens',
                    chaptersAccessor: 'pop' // first => shift, last => pop, index => Integer
                }, {
                    connectorClass: 'EpikManga',
                    mangaID: '/seri/battle-through-the-heavens',
                    mangaTitle: 'Battle Through the Heavens',
                    chapterID: '/seri/battle-through-the-heavens/bolum/6',
                    chapterTitle: '#1 Artık Dahi Değil',
                    pageCount: 20,
                    pageMatcher: /^https:\/\/www\.epikmanga.com\/upload\/manga\/battle-through-the-heavens\/1\/\d+.jpg$/
                });
            });
        });
    });
});