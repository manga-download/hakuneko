import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class PixivComics extends Connector {

    constructor() {
        super();
        this.id = 'pixivcomics';
        this.label = 'pixivコミック';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://comic.pixiv.net/';
        this.apiURL = 'https://comic.pixiv.net/api/app';
        this.requestOptions.headers.set('x-referer', this.url);
        this.requestOptions.headers.set('x-requested-with', this.url);
    }

    async _getMangaFromURI(uri) {
        let request = new Request(new URL(this.apiURL + '/works/v3/' + uri.pathname.match(/\d+$/)[0]), this.requestOptions);
        let data = await this.fetchJSON(request);
        let id = data.data.official_work.id;
        let title = data.data.official_work.name.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(new URL(this.apiURL + '/magazines'), this.requestOptions);
        let data = await this.fetchJSON(request);
        let pages = data.data.magazines.map(item => item.id);
        for(let page of pages) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(new URL(this.apiURL + '/magazines/' + page), this.requestOptions);
        let data = await this.fetchJSON(request);
        return data.data.official_works.map(item => {
            return {
                id: item.id,
                title: item.name.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(new URL(this.apiURL + '/works/v3/' + manga.id), this.requestOptions);
        let data = await this.fetchJSON(request);
        return data.data.official_work.stories
            .filter(item => item.readable)
            .map(item => {
                return {
                    id: item.story.id, // this.getRootRelativeOrAbsoluteLink(element, request.url),
                    title: item.story.short_name + ' - ' + item.story.name, // element.text.trim(),
                    language: ''
                };
            });
    }

    async _getPages(chapter) {
        let request = new Request(new URL('/viewer/stories/' + chapter.id, this.url), this.requestOptions);
        request.headers.set('x-cookie', 'open_work_page=yes; is_browser=yes');
        let data = await this.fetchDOM(request, 'head');
        let token = data[0].querySelector('meta[name="csrf-token"]').content;
        let url = data[0].querySelector('meta[name="viewer-api-url"]').content;
        let requestAPI = new Request(new URL(url, request.url));
        //requestAPI.headers.set('x-cookie', 'open_work_page=yes; is_browser=yes');
        requestAPI.headers.set('x-csrf-token', token);
        requestAPI.headers.set('x-referer', request.url);
        requestAPI.headers.set('x-requested-with', 'XMLHttpRequest');
        data = await this.fetchJSON(requestAPI);
        return data.data.contents.shift().pages.reduce((accumulator, page) => {
            page.right && accumulator.push(page.right.data.url);
            page.left && accumulator.push(page.left.data.url);
            return accumulator;
        }, []).map(image => this.createConnectorURI(image));
    }

    async _handleConnectorURI(payload) {
        let request = new Request(payload, this.requestOptions);
        let response = await fetch(request);
        let data = await response.blob();
        return this._blobToBuffer(data);
    }
}