import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Tapread extends Connector {

    constructor() {
        super();
        super.id = 'tapread';
        super.label = 'Tapread';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://www.tapread.com';
        this.imgURL = 'https://static.tapread.com';
    }

    /**
     *
     */
    async _getMangaFromURI(uri) {
        try {
            let request = new Request(uri.href, this.requestOptions);
            let data = await this.fetchDOM(request, 'div.book-container div.book-info div.book-name');
            let id = uri.pathname.split('/').pop();
            let title = data[0].textContent.trim();
            return new Manga(this, id, title);
        } catch(error) {
            console.warn(error, this);
            return Promise.reject();
        }
    }

    /**
     *
     */
    async _getMangaList(callback) {
        try {
            let request = new Request(this.url + '/comic/moredetail', this.requestOptions);
            let data = await this.fetchJSON(request);
            let mangaList = data.result.moreDetailList.map(entry => {
                return {
                    id: entry.comicId,
                    title: entry.comicName
                };
            });
            callback(null, mangaList);
        } catch(error) {
            console.error(error, this);
            callback(error, undefined);
        }
    }

    /**
     *
     */
    async _getChapterList( manga, callback ) {
        try {
            let request = new Request(this.url + '/comic/contents?comicId=' + manga.id, this.requestOptions);
            let data = await this.fetchJSON(request);
            let chapterList = data.result.chapterList.map(entry => {
                return {
                    id: entry.chapterId,
                    title: entry.chapterNo + ' - ' + entry.chapterName,
                    language: ''
                };
            });
            callback(null, chapterList);
        } catch(error) {
            console.error(error, manga);
            callback(error, undefined);
        }
    }

    /**
     *
     */
    async _getPageList( manga, chapter, callback ) {
        try {
            let uri = new URL('/comic/chapter', this.url);
            uri.searchParams.set('comicId', manga.id);
            uri.searchParams.set('chapterId', chapter.id);
            let request = new Request(uri.href, this.requestOptions);
            let data = await this.fetchJSON(request);
            let pageList = data.result.imgList.map(entry => this.getAbsolutePath(entry.imgUrl /* imgWebpUrl */, this.imgURL));
            callback(null, pageList);
        } catch(error) {
            console.error(error, chapter);
            callback(error, undefined);
        }
    }
}