import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

/**
 *
 */
export default class ReadMNG extends Connector {

    /**
     * Very similar to mangadoom
     */
    constructor() {
        super();
        super.id = 'readmng';
        super.label = 'ReadMangaToday';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://www.readmng.com';
        this.requestOptions.headers.set( 'x-referer', this.url );
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const id = uri.pathname;
        const item = await this.fetchDOM(request, 'div.titleArea > h2');
        const title = item[0].textContent.trim();
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
        const uri = new URL('/manga-list/' + page, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, '.mangaSliderCard a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('.postDetail h2').textContent.trim()
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'a.chnumber');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.match(/Chapter \d+/)[0],
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        const script = `
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        resolve(ts_reader.params.sources.shift().images);
                    } catch(error) {
                        reject(error);
                    }
                }, 2500);
            });
        `;
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        return Engine.Request.fetchUI(request, script);
    }
}