import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class SenManga extends Connector {

    constructor() {
        super();
        super.id = 'senmanga';
        super.label = 'SenManga';
        this.tags = [ 'manga', 'multi-lingual'];
        this.url = 'https://www.senmanga.com';
        this.links = {
            login: 'https://www.senmanga.com/login'
        };
        this.requestOptions.headers.set('x-referer', this.url);
        this.requestOptions.headers.set('x-origin', this.url);

    }

    get icon() {
        return '/img/connectors/rawsenmanga';
    }

    async _getMangaFromURI(uri) {
        const id = uri.href.split('/').pop();
        const url = new URL('/api/title/' + id, this.url).href;
        const request = new Request(url, this.requestOptions);
        const data = await this.fetchJSON(request);
        return new Manga(this, data.data.id, data.data.title.trim());
    }

    async _getMangas() {
        const mangalist = [];
        for (let offset = 0, run = true; run; offset+= 60) {
            const mangas = await this._getMangasFromPage(offset);
            mangas.length > 0 ? mangalist.push(...mangas) : run = false;
            await this.wait(500);
        }
        return mangalist;
    }

    async _getMangasFromPage(offset) {
        //note : website API is very broken, i got error 500 while browsing directory on a naked firefox
        //cant fix that :/
        const url = new URL('/api/search?limit=60&offset=' + offset, this.url);
        const request = new Request(url, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.success ? data.data.map(element => new Manga(this, element.id, element.title.trim())) : [];
    }

    async _getChapters(manga) {
        const url = new URL('/api/title/' + manga.id +'/chapters', this.url).href;
        const request = new Request(url, this.requestOptions);
        const data = await this.fetchJSON(request);
        return !data.success ? [] : data.data
            .filter(element => element.externalUrl == null) //i.e english chapters are on Mangaplus
            .map(element => {
                return {
                    id: '/read/' + element.id,
                    title :  element.full_title.trim() + ' (' + element.language.code + ')',
                    language : element.language.code
                };
            });
    }

    async _getPages(chapter) {
        const request = new Request(this.url + chapter.id, this.requestOptions);
        return Engine.Request.fetchUI(request, '__NEXT_DATA__.props.pageProps.chapter.pageList.url');

    }

}