import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class SoftKomik extends Connector {

    constructor() {
        super();
        super.id = 'softkomik';
        super.label = 'Softkomik';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://softkomik.site';
        this.api = 'https://img.softkomik.online/api/';
        this.cdn = 'https://cdn.statically.io/img/softkomik.online/';
        this.links = {
            login: this.url + '/akun'
        };
    }

    async _getMangaFromURI(uri) {
        const id = uri.pathname.split('/').pop();
        const request = new Request(new URL('lihat-komik/' + id, this.api), this.requestOptions);
        const data = await this.fetchJSON(request);
        return new Manga(this, data.DataKomik.title_slug, data.DataKomik.title);
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
        const uri = new URL('komik-list?page=' + page, this.api);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.DaftarKomik.data.map(entry => {
            return {
                id: entry.title_slug,
                title: entry.title.trim()
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL('lihat-komik/' + manga.id, this.api);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.DataChapter.map(entry => {
            return {
                id: entry.chapter,
                title: entry.chapter
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(`baca-chapter/${chapter.manga.id}&${chapter.id}`, this.api);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.DataGambar.map(entry => this.getAbsolutePath(entry.url_gambar, this.cdn));
    }
}