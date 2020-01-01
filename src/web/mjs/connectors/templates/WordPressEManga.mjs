import Connector from '../../engine/Connector.mjs';

// TODO: rename theme to 'MangaStream': https://themesia.com/mangastream-wordpress-theme/
export default class WordPressEManga extends Connector {

    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.tags = [];
        this.url = undefined;
        this.path = '/list/';

        this.queryMangas = 'div#content div.soralist ul li a.series';
        this.queryChapters = 'div.cl ul li span.leftoff a';
        this.queryPages = 'div#readerarea source[src]:not([src=""])';
    }

    async _getMangaList(callback) {
        try {
            let request = new Request(this.url + this.path, this.requestOptions);
            let data = await this.fetchDOM(request, this.queryMangas);
            let mangaList = data.map(element => {
                return {
                    id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                    title: element.text.trim()
                };
            });
            callback(null, mangaList);
        } catch(error) {
            console.error(error, this);
            callback(error, undefined);
        }
    }

    async _getChapterList(manga, callback) {
        try {
            let request = new Request(this.url + manga.id, this.requestOptions);
            let data = await this.fetchDOM(request, this.queryChapters);
            let chapterList = data.map(element => {
                return {
                    id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                    title: element.text.replace(manga.title, '').trim(),
                    language: ''
                };
            });
            callback(null, chapterList);
        } catch(error) {
            console.error(error, manga);
            callback(error, undefined);
        }
    }

    async _getPages(chapter) {
        let request = new Request(this.url + chapter.id, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryPages);
        return data.map(element => this.getAbsolutePath(element.dataset['lazySrc'] || element.dataset['src'] || element, request.url))
            .filter(link => !link.includes('histats.com'));
    }
}