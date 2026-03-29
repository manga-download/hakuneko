import FlatManga from './templates/FlatManga.mjs';

// Similar to WeLoMa
export default class WeLoveManga extends FlatManga {

    constructor() {
        super();
        super.id = 'lovehug';
        super.label = 'WeLoveManga';
        this.tags = [ 'manga', 'hentai', 'raw', 'japanese' ];
        this.url = 'https://welovemanga.one';
        this.path = '/manga-list.html';
        this.requestOptions.headers.set('x-referer', this.url);

        this.queryMangaTitle = 'ul.manga-info h3';
        this.queryMangas = 'div.card-body div.series-title a';
        this.queryChapters = 'ul.list-chapters > a';
        this.queryChapterTitle = 'div.chapter-name';
    }

    async _initializeConnector() {
        for(let path of [this.path, '/0/0/']) {
            const uri = new URL(path, this.url);
            const request = new Request(uri, this.requestOptions);
            return Engine.Request.fetchUI(request, '', 30000, true);
        }
    }

    async _getMangas() {
        let mangaList = [];
        const uri = new URL(this.path, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'ul.pagination li:nth-last-of-type(2) a');
        const pageCount = parseInt(data[0].text.trim());
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
            await this.wait(5000);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL(this.path, this.url);
        uri.searchParams.set('page', page);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        const script = `
            new Promise(resolve => {
                const chapters = [...document.querySelectorAll('ul.list-chapters > a')].map(element => {
                    return {
                        id: element.pathname,
                        title: element.title
                    };
                });
                resolve(chapters);
            });
        `;
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        return Engine.Request.fetchUI(request, script);
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        let request = new Request(uri, this.requestOptions);
        const chapterid = (await this.fetchDOM(request, 'input#chapter'))[0].value;
        request = new Request(new URL(`/app/manga/controllers/cont.listImg.php?cid=${chapterid}`, this.url), this.requestOptions);
        const nodes = await this.fetchDOM(request, 'source.chapter-img:not([alt*="nicoscan"])');
        return nodes.map(image => this.createConnectorURI(image.dataset.srcset.replace(/\n/g, '')));
    }
}
