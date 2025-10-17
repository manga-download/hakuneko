import Comici from './templates/Comici.mjs';
import Manga from '../engine/Manga.mjs';

export default class YoungChampion extends Comici {
    constructor() {
        super();
        super.id = 'takecomic';
        super.label = 'Take Comic';
        this.tags = ['manga', 'japanese'];
        this.url = 'https://takecomic.jp';
        this.apiUrl = this.url;
        this.links = {
            login: 'https://takecomic.jp/auth/signin'
        };

        this.queryMangaTitleURI = 'h1.series-h-title';
        this.apiPath = '/api/';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri);
        const [data] = await this.fetchDOM(request, this.queryMangaTitleURI);
        const id = uri.pathname.replace('/series/', '');
        const title = data.lastChild.textContent.trim();
        return new Manga(this, id, title);
    }

    async _getChapters(manga) {
        const uri = new URL('/api/episodes', this.url);
        uri.searchParams.append('seriesHash', manga.id);
        uri.searchParams.append('episodeTo', 999);
        const request = new Request(uri);
        const data = await this.fetchJSON(request);
        return data.series.episodes;
    }

    async _fetchCoordInfo(viewer) {
        //first request get page count
        let uri = new URL(this.apiPath+'book/contentsInfo', this.url);
        uri.searchParams.set('comici-viewer-id', viewer.dataset['comiciViewerId']);
        uri.searchParams.set('user-id', viewer.dataset['memberJwt']);
        uri.searchParams.set('page-from', '0');
        uri.searchParams.set('page-to', '1');
        let request = new Request(uri);
        request.headers.set('x-origin', this.url);
        request.headers.set('x-referer', this.url);
        const data = await this.fetchJSON(request);

        //second request fetch actual pages data
        const numbers = data.totalPages;
        uri = new URL(this.apiPath+'book/contentsInfo', this.url);
        uri.searchParams.set('comici-viewer-id', viewer.dataset['comiciViewerId']);
        uri.searchParams.set('user-id', viewer.dataset['memberJwt']);
        uri.searchParams.set('page-from', '0');
        uri.searchParams.set('page-to', numbers);
        request = new Request(uri);
        request.headers.set('x-origin', this.url);
        request.headers.set('x-referer', this.url);
        return await this.fetchJSON(request);
    }
}
