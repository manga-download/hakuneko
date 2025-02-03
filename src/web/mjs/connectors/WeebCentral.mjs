import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class WeebCentral extends Connector {

    constructor() {
        super();
        super.id = 'weebcentral';
        super.label = 'Weeb Central';
        this.tags = [ 'manga', 'manhua', 'manhwa', 'english' ];
        this.url = 'https://weebcentral.com';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const [ title ] = await this.fetchDOM(request, 'meta[property="og:title"]');
        return new Manga(this, uri.pathname, title.content.split('|').shift().trim());
    }

    async _getMangas() {
        const mangaList = [];
        for (let page = 0, run = true; run; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const limit = 32;
        let offset = page * limit;

        const uri = new URL(`/search/data?display_mode=Minimal+Display&limit=${limit}&offset=${offset}`, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'article > a.link');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        const serieId = manga.id.match(/(\/series\/[^/]+)\//)[1];
        const uri = new URL(`${serieId}/full-chapter-list`, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'a[href*="/chapters/"]');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('span.grow span').textContent.trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);

        const pageScript = `
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        resolve([...document.querySelectorAll('main section img[alt*="Page"]:not([x-show])')].map(img => img.src));
                    } catch(error) {
                        reject(error);
                    }
                }, 2500);
            });
        `;

        const data = await Engine.Request.fetchUI(request, pageScript);
        return data.map(element => this.getAbsolutePath(element, request.url));
    }
}
