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

    _getMangaListFromPages(page) {
        page = page || 1;
        let uri = new URL('/sapi/comics', this.url);
        uri.searchParams.set('page', page);
        let request = new Request(uri.href, this.requestOptions);
        return this.fetchJSON(request)
            .then(data => {
                let mangaList = data.results.map(manga => {
                    return {
                        id: manga.id + ',' + manga.e4pid,
                        title: manga.name
                    };
                });
                if (mangaList.length == 25) {
                    return this._getMangaListFromPages(page + 1)
                        .then(mangas => mangaList.concat(mangas));
                } else {
                    return Promise.resolve(mangaList);
                }
            });
    }

    _getMangaList(callback) {
        this._getMangaListFromPages()
            .then(data => callback(null, data))
            .catch(error => {
                console.error(error, this);
                callback(error, undefined);
            });
    }

    _getChapterList(manga, callback) {
        let request = new Request(this.chapterUrl + manga.id.split(',')[1] + '/content?clientid=dylMNK5a32of', this.requestOptions);
        this.fetchJSON(request)
            .then(data => {
                let chapterList = data.data.episodes.map(chapter => {
                    let name = chapter.name;
                    let title = '';
                    if (name.length > 0) {
                        title = name.shift().name;
                        console.log(title);
                    }
                    title = title ? ' - ' + title : '';
                    return {
                        id: chapter.id,
                        title: chapter.number + title,
                        language: chapter.language
                    };
                });
                callback(null, chapterList);
            })
            .catch(error => {
                console.error(error, manga);
                callback(error, undefined);
            });
    }

    _getPageList(manga, chapter, callback) {
        let uri = new URL('sapi/comics/' + manga.id.split(',')[0] + '/read', this.url);
        uri.searchParams.set('format', 'json');
        uri.searchParams.set('content', chapter.id);
        let chapterRequest = new Request(uri.href, this.requestOptions);
        let data = this.fetchJSON(chapterRequest);
        let request = new Request(data.href, this.requestOptions);
        this.fetchJSON(request)
            .then(data => {
                let pageList = data.readingOrder.map(
                    page => page.href
                );
                callback(null, pageList);
            })
            .catch(error => {
                console.error(error, chapter);
                callback(error, undefined);
            });
    }
}