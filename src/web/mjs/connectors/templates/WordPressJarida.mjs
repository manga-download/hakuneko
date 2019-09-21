import Connector from '../../engine/Connector.mjs';

// Very similar to NewsMax theme used in YouBaMangaNext
export default class WordPressJarida extends Connector {

    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.tags = [];
        this.url = undefined;
        this.apiPath = '/wp-json/wp/v2/';
    }

    async _getMangaList(callback) {
        try {
            let uri = new URL(this.apiPath + 'categories', this.url);
            uri.searchParams.set('per_page', 100);
            let request = new Request(uri, this.requestOptions);
            let data = await this.fetchJSON(request);
            let mangaList = data.map(category => {
                return {
                    id: category.id,
                    title: category.name
                };
            });
            callback(null, mangaList);
        } catch(error) {
            console.error(error, this);
            callback(error, undefined);
        }
    }

    async _getChapterListFromPages(manga, page) {
        page = page || 1;
        // NOTE: per_page is capped at 100
        let uri = new URL(this.apiPath + 'posts', this.url);
        uri.searchParams.set('page', page);
        uri.searchParams.set('per_page', 100);
        uri.searchParams.set('categories', manga.id);
        let request = new Request(uri, this.requestOptions);
        // NOTE: Do not use `fetchJSON`, because it will fail on HTTP response code 400
        let response = await fetch(request);
        let data = await response.json();
        if(Array.isArray(data) && data.length > 0) {
            let chapterList = data.map(post => {
                return {
                    id: this.getRootRelativeOrAbsoluteLink(post.link, this.url), // post.slug
                    title: post.title.rendered.replace(manga.title, '').trim(),
                    language: ''
                };
            });
            let chapters = await this._getChapterListFromPages(manga, page + 1);
            return chapterList.concat(chapters);
        } else {
            return [];
        }
    }

    async _getChapterList( manga, callback ) {
        try {
            let data = await this._getChapterListFromPages(manga);
            callback(null, data);
        }
        catch(error) {
            console.error(error, manga);
            callback(error, undefined);
        }
    }

    async _getPageList(manga, chapter, callback) {
        try {
            let request = new Request(this.url + chapter.id, this.requestOptions);
            let data = await this.fetchDOM(request, 'div.entry figure.wp-block-image source');
            let pageList = data.map(element => this.getAbsolutePath(element.dataset['lazySrc'] || element, request.url));
            callback(null, pageList);
        } catch(error) {
            console.error(error, chapter);
            callback(error, undefined);
        }
    }
}