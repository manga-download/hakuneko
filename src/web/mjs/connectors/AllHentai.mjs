import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class AllHentai extends Connector {

    constructor() {
        super();
        super.id = 'allhentai';
        super.label = 'AllHentai';
        this.tags = ['hentai', 'russian'];
        this.url = 'https://20.allhen.online';
        this.links = {
            login: 'https://20.allhen.online/internal/auth'
        };
        this.config = {
            throttle: {
                label: 'Throttle Requests [ms]',
                description: 'Enter the timespan in [ms] to delay consecutive HTTP requests.\nThe website may block you for to many consecuitive requests.',
                input: 'numeric',
                min: 1000,
                max: 7500,
                value: 1500
            }
        };
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'meta[itemprop="name"]', 3);
        let id = uri.pathname;
        let title = data[0].content.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        for (let page = 0, run = true; run; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
            await this.wait(this.config.throttle.value);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL('/list?offset=' + page*70, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div#mangaBox div.desc h3 a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.textContent.trim()
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div#chapters-list table tr td a[title]');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title : element.text.replace(manga.title, '').trim(),
            };
        });
    }

    async _getPages(chapter) {
        const script = `new Promise(resolve => {
                resolve(rm_h.pics.map(picture => picture.url));
        });`;

        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        let data = [];
        try {
            data = await Engine.Request.fetchUI( request, script);
            return data.map(element => this.getAbsolutePath(element, this.url));
        } catch (error) {
            throw new Error('No pictures found, make sure you are logged to the website !');
        }

    }

}
