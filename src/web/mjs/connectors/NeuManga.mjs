import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class NeuManga extends Connector {

    constructor() {
        super();
        super.id = 'neumanga';
        super.label = 'NeuManga';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://neumanga.net';
        this.path = '/manga-list';
        this.queryMangas = 'div.mangalist-blc ul li a.series';
        this.queryChapters = 'ul.series-chapterlist li div.flexch-infoz a';
        this.queryPages = 'div.reader-area p source';
        this.queryMangaTitle = 'div.series-title h2';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangaTitle);
        const id = uri.pathname;
        const title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        const request = new Request(new URL(this.path, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return{
                id: this.getRelativeLink( element ),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        const request = new Request(new URL(manga.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, this.queryChapters);
        return data.map(element => {
            return{
                id: this.getRelativeLink( element ),
                title: element.querySelector('span').textContent.trim()
            };
        });
    }

    async _getPages(chapter) {
        const request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, this.queryPages);
        return data.map(element => this.getRootRelativeOrAbsoluteLink(element, this.url));
    }
}
