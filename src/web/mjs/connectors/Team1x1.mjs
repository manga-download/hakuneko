import Connector from '../engine/Connector.mjs';
import Manga from '../engine/manga.mjs';

export default class Team1x1 extends Connector {

    constructor() {
        super();
        super.id = 'team1x1';
        super.label = 'Team X';
        this.tags = ['webtoon', 'arabic'];

        this.config = {
            url: {
                label: 'URL',
                description: 'This website changes their URL regularly.\nThis is the last known URL which can also be manually set by the user.',
                input: 'text',
                value: 'https://Teamxmanga.com'
            }
        };
    }

    get url() {
        return this.config.url.value;
    }

    set url(value) {
        if (this.config && value) {
            this.config.url.value = value;
            Engine.Settings.save();
        }
    }

    canHandleURI(uri) {
        return /team1x\d*\.com|tqneplus\.com/.test(uri.hostname);
    }

    async _initializeConnector() {
        let uri = new URL(this.url);
        let request = new Request(uri.href, this.requestOptions);
        this.url = await Engine.Request.fetchUI(request, `window.location.origin`);
        console.log(`Assigned URL '${this.url}' to ${this.label}`);
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.row > div.col-md-9 > h3');
        const id = uri.pathname + uri.search;
        const title = data[0].textContent;
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        for (let page = 1, run = true; run; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL(`/manga/page/${page}/`, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div#page-manga div.container div.last-post-manga div.thumb div.info h3 a');
        return data.map(element => {
            return {
                id: element.pathname,
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let chapterList = [];
        const request = new Request(this.url + manga.id, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.pagination span.current');
        const pageCount = parseInt(data[0].textContent.trim());
        for (let page = 1; page <= pageCount; page++) {
            let chapters = await this._getChaptersFromPage(page, manga);
            chapterList.push(...chapters);
        }
        return chapterList;
    }

    async _getChaptersFromPage(page, manga) {
        const request = new Request(this.url + manga.id + '/page/' + page, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.single-manga-chapter div.container div.row div.col-md-12 a');
        return data
            .filter(element => element.href.startsWith(this.url))
            .map(element => {
                return {
                    id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                    title: element.text.replace(manga.title, '').trim(),
                    language: ''
                };
            }).reverse();
    }

    async _getPages(chapter) {
        let request = new Request(this.url + chapter.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'div[id^="translationPageall"] embed');
        return data.map(dat => dat.src);
    }
}