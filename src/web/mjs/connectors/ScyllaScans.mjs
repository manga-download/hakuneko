import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ScyllaScans extends Connector {

    constructor() {
        super();
        super.id = 'scyllascans';
        super.label = 'Scylla Scans';
        this.tags = [ 'manga', 'webtoon', 'english', 'scanlation' ];
        this.url = 'https://scyllacomics.xyz';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'section source.object-cover');
        const id = uri.pathname;
        const title = data[0].getAttribute('alt').trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        for (let page = 1, run = true; run; page++) {
            const mangas = await this.getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async getMangasFromPage(page) {
        const uri = new URL(`/manga?page=${page}`, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div#card-real a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('img').getAttribute('alt').trim()
            };
        });
    }

    async _getChapters(manga) {
        const chapterList = [];
        for (let page = 1, run = true; run; page++) {
            const chapters = await this.getChaptersFromPage( manga, page);
            chapters.length > 0 ? chapterList.push(...chapters) : run = false;
        }
        return chapterList;
    }

    async getChaptersFromPage(manga, page) {
        const uri = new URL(`${manga.id}?page=${page}`, this.url);
        const data = await this.fetchDOM(new Request(uri, this.requestOptions), 'div#chapters-list a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('span').textContent.trim()
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div#chapter-container source.chapter-image');
        return data.map(element => element.dataset.src);
    }
}
