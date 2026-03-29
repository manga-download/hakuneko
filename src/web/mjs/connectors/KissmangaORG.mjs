import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class KissmangaORG extends Connector {

    constructor() {
        super();
        super.id = 'kissmangaorg';
        super.label = 'Kissmanga.org';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://kissmanga.org';
        this.path = '/manga_list/';

        this.queryMangas = 'div.listing div.item_movies_in_cat div a.item_movies_link';
        this.queryChapters = 'div#leftside div.full div.episodeList div.full div.listing.full div div h3 a';
        this.queryPages = 'div.barContent div.full div.full.watch_container div#centerDivVideo source';
        this.queryMangaTitle = 'div.bigBarContainer div.barContent div.full h2';
    }

    async _getMangas() {
        let mangaList = [];
        for(let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length ? mangaList.push(...mangas) : run = false;
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
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryChapters);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.replace(manga.title + ' -', '').trim()
            };
        });
    }

    async _getPages(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryPages);
        return data.map(element => this.getAbsolutePath(element.src, this.url));
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangaTitle);
        const id = uri.pathname;
        const title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

}