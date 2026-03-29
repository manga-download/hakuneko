import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class WebNovel extends Connector {

    constructor() {
        super();
        super.id = 'webnovel';
        super.label = 'Webnovel Comics';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://www.webnovel.com';
        this.token = '';
    }

    async _initializeConnector() {
        const uri = new URL( this.url );
        const request = new Request( uri.href, this.requestOptions );
        this.token = await Engine.Request.fetchUI( request, `new Promise( resolve => resolve( decodeURIComponent( document.cookie ).match( /_csrfToken=([^;]+);/ )[1] ) )` );
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await Engine.Request.fetchUI(request, `new Promise( resolve => resolve( window.g_data.book.comicInfo));`);
        return new Manga(this, data.comicId, data.comicName.trim());
    }

    async _getMangas() {
        const mangaList = [];
        for (let page = 1, run = true; run; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        page = page || 1;
        const uri = new URL( '/go/pcm/category/categoryAjax', this.url );
        uri.searchParams.set( 'pageIndex', page );
        uri.searchParams.set( '_csrfToken', this.token );
        uri.searchParams.set( 'categoryId', 0 );
        uri.searchParams.set( 'categoryType', 2 );
        const request = new Request( uri.href, this.requestOptions );
        const data = await this.fetchJSON( request );
        return data.data.items.map(manga => {
            return {
                id: manga.bookId,
                title: manga.bookName
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL( '/go/pcm/comic/getChapterList', this.url );
        uri.searchParams.set( 'comicId', manga.id );
        uri.searchParams.set( '_csrfToken', this.token );
        const request = new Request( uri.href, this.requestOptions );
        const data = await this.fetchJSON( request );
        return data.data.comicChapters.map(chapter => {
            return {
                id : chapter.chapterId,
                title:  chapter.chapterIndex + ' : ' + chapter.chapterName,
                language : ''
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL( '/go/pcm/comic/getContent', this.url );
        uri.searchParams.set('width', 1920);
        uri.searchParams.set( 'comicId', chapter.manga.id );
        uri.searchParams.set( 'chapterId', chapter.id );
        uri.searchParams.set( '_csrfToken', this.token );
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON( request );
        return data.data.chapterInfo.chapterPage.map(page => this.getAbsolutePath(page.url, request.url));
    }
}
