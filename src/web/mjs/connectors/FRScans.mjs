import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class FRScan extends Connector {

    constructor() {
        super();
        super.id = 'Frscan';
        super.label = 'Frscan';
        this.tags = [ 'manga', 'french' ];
        this.url = 'https://fr-scan.com';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const [data] = await this.fetchDOM(request, 'section source.object-cover');
        const id = uri.pathname;
        const title = data.getAttribute('alt').trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        const mangaList = [];
        for (let page = 1, run = true; run; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL(`/manga/page/${page}`, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.post-title.font-title h3.h5 a');
        return data.map(element => {
            return {
                id: element.pathname,
                title: element.text
            };
        });
    }

    async _getChapters(manga) {
        const chapterlist = [];
        for (let page = 1, run = true; run; page++) {
            const chapters = await this._getChaptersFromPage(manga, page);
            chapters.length > 0 ? chapterlist.push(...chapters) : run = false;
        }
        return chapterlist;
    }

    async _getChaptersFromPage(manga, page) {
        const uri = new URL(`${manga.id}chapitre-${page}-vf`, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.read-container');
        return data.map(element => {
            return {
                id: `chapitre-${page}-vf`,
                title: `Chapitre ${page}`
            };
        });
    }

    async _getPages(chapter) {
        const request = new Request(new URL(`${chapter.manga.id}${chapter.id}`, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'div.page-break');
        return data.map(element => {
            let srcUrl = element.innerText;
            srcUrl = srcUrl.split('https')[1];
            srcUrl = srcUrl.split('"')[0];
            return `https${srcUrl}`
            });
     }
}
