import Connector from '../engine/Connector.mjs';

export default class ComiKey extends Connector {

    constructor() {
        super();
        super.id = 'comikey';
        super.label = 'Comikey';
        this.tags = ['manga', 'webtoon', 'english'];
        this.url = 'https://comikey.com';
        this.chapterUrl = 'https://relay-us.epub.rocks/consumer/COMIKEY/series/';
    }

    async _getMangas() {
        let mangaList = [];
        for (let page = 1, run = true; run; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
            mangas.length == 25 ? run = true : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let uri = new URL('/sapi/comics', this.url);
        uri.searchParams.set('page', page);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.results.map(manga => {
            return {
                id: manga.id + ',' + manga.e4pid,
                title: manga.name
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id.split(',')[1] + '/content?clientid=dylMNK5a32of', this.chapterUrl);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.data.episodes.map(chapter => {
            let name = chapter.name;
            let title = '';
            if (name.length > 0) {
                title = name.shift().name;
            }
            title = title ? ' - ' + title : '';
            return {
                id: chapter.id,
                title: chapter.number + title,
                language: chapter.language
            };
        });
    }

    async _getPages(chapter) {
        let uri = new URL('sapi/comics/' + chapter.manga.id.split(',')[0] + '/read', this.url);
        uri.searchParams.set('format', 'json');
        uri.searchParams.set('content', chapter.id);
        let chapterRequest = new Request(uri.href, this.requestOptions);
        let data = await this.fetchJSON(chapterRequest);
        const request = new Request(data.href, this.requestOptions);
        const pageData = await this.fetchJSON(request);
        return pageData.readingOrder.map(image => image.href);
    }
}