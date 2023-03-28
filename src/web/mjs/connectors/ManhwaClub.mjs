import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ManhwaClub extends Connector {

    constructor() {
        super();
        super.id = 'manhwaclub';
        super.label = 'ManhwaClub';
        this.tags = [ 'webtoon', 'hentai', 'multi-lingual' ];
        this.url = 'https://manhwa.club';
        this.apiURL='/api/comics';
    }
    async _getMangaFromURI(uri) {
        let id = uri.pathname.split('/');
        id = id[id.length-1];
        uri = new URL(this.apiURL + '/' + id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return new Manga(this, id, data.title.trim());
    }
    async _getMangas() {
        let mangaList = [];
        for (let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }
    async _getMangasFromPage(page) {
        const uri = new URL(this.apiURL + '?page=' + page, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.data.map(element => {
            return {
                id: element.slug,
                title: element.title.trim()
            };
        });
    }
    async _getChapters(manga) {
        const uri = new URL(this.apiURL + '/' + manga.id+'/chapters', this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.map(element => {
            return {
                id: element.slug,
                title: element.name.trim(),
            };
        });
    }
    async _getPages(chapter) {
        const uri = new URL(this.apiURL + '/' + chapter.manga.id+'/'+ chapter.id+'/images', this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.images.map(element => element.source_url);
    }
}
