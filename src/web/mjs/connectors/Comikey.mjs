import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ComiKey extends Connector {

    constructor() {
        super();
        super.id = 'comikey';
        super.label = 'Comikey';
        this.tags = ['manga', 'webtoon', 'english'];
        this.url = 'https://comikey.com';
        this.chapterUrl = 'https://relay-us.epub.rocks/consumer/COMIKEY/series/';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request);
        return new Manga(this, uri.pathname, data.querySelector('span.title').innerText);
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
        let uri = new URL('/comics/', this.url);
        uri.searchParams.set('order', 'name');
        uri.searchParams.set('page', page);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request);

        let mangaList = [...data.querySelectorAll('.series-listing.full-row[data-view="list"] > ul > li > div.series-data > span.title > a')];
        return mangaList.map(manga => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(manga, this.url),
                title: manga.innerText
            };
        });
    }

    async _getChapters(manga) {
        let webUri = new URL(manga.id, this.url);
        const webRequest = new Request(webUri, this.requestOptions);
        const webData = await this.fetchDOM(webRequest);
        const e4pid = JSON.parse(webData.querySelector('script#comic').innerText).e4pid;
        let apiUri = new URL(e4pid + '/content?clientid=dylMNK5a32of', this.chapterUrl);
        const apiRequest = new Request(apiUri, this.requestOptions);
        const apiData = await this.fetchJSON(apiRequest);
        let idTemplate = manga.id.split('/');
        let idTemp = idTemplate.slice(0, idTemplate.length - 2).join('/') + '/';
        let idTempFinal = idTemp.replace('comics', 'read');
        return apiData.data.episodes.map(chapter => {
            let chapterName = '';
            chapter.name.length > 0 ? chapterName = chapter.name[0].name : '';
            chapterName ? chapterName = " - " + chapterName : '';
            return {
                id: idTempFinal + chapter.id.split('-')[1] + '/chapter-' + chapter.number.toString().replace('.', '-'),
                title: 'Chapter ' + chapter.number.toString() + chapterName,
                language: chapter.language
            };
        });
    }

    async _getPages(chapter) {
        let uri = new URL(chapter.id, this.url);
        let chapterRequest = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(chapterRequest);
        const manifestUrl = JSON.parse(data.querySelector('script#reader-init').innerText).manifest;
        const manifestRequest = new Request(manifestUrl, this.requestOptions);
        const pageData = await this.fetchJSON(manifestRequest);
        return pageData.readingOrder.map(image => image.href);
    }
}