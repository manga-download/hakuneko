import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ReadManhwa extends Connector {

    constructor() {
        super();
        super.id = 'readmanhwa';
        super.label = 'ReadManhwa';
        this.tags = [ 'webtoon', 'manga', 'english' ];
        this.url = 'https://readmanhwa.com';
        this.links = {
            login: 'https://readmanhwa.com/en/login'
        };
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
        const uri = new URL('/api/comics', this.url);
        uri.searchParams.set('page', page);
        uri.searchParams.set('sort', 'uploaded_at');
        uri.searchParams.set('order', 'asc');
        uri.searchParams.set('duration', 'day');
        uri.searchParams.set('nsfw', true);
        const request = new Request(uri, this.requestOptions);
        const response = await this.fetchJSON(request);
        const data = response.data;

        if(!data) return [];

        return data.map(el => {
            return {
                id: el.slug,
                title: el.title
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(`/api/comics/${manga.id}/chapters`, this.url);
        uri.searchParams.set('nsfw', true);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.map(el => {
            return {
                id: el.slug,
                title: el.name,
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(`/api/comics/${chapter.manga.id}/${chapter.id}/images`, this.url);
        uri.searchParams.set('nsfw', true);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.images.map(el => {
            return el.source_url;
        });
    }

    async _getMangaFromURI(uri) {
        const ch = uri.pathname.split('/');
        const slug = ch[ch.length-1];
        const request = new Request(new URL(`/api/comics/${slug}?nsfw=true`, this.url), this.requestOptions);
        const data = await this.fetchJSON(request);
        const id = data.slug;
        const title = data.title;
        return new Manga(this, id, title);
    }

}