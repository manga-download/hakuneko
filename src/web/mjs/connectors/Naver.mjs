import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Naver extends Connector {

    constructor() {
        super();
        super.id = 'naver';
        super.label = '네이버 웹툰 (Naver Webtoon)';
        this.tags = [ 'webtoon', 'korean' ];
        this.url = 'https://comic.naver.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div#content div.comicinfo div.detail h2', 3);
        uri.searchParams.delete('page');
        let id = uri.pathname + uri.search;
        let title = data[0].childNodes[0].nodeValue.trim();
        return new Manga(this, id, title);
    }

    /**
     *
     */
    _getMangaList( callback ) {
        let msg = 'This website does not provide a manga list, please copy and paste the URL containing the chapters directly from your browser into HakuNeko.';
        callback( new Error( msg ), undefined );
    }

    /**
     *
     */
    _getChapterListFromPages( manga, chapterPageLinks, index ) {
        index = index || 0;
        let request = new Request( chapterPageLinks[ index ], this.requestOptions );
        return this.fetchDOM( request, 'div#content table.viewList tbody tr td.title a', 5 )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
                        title: element.text.replace( manga.title, '' ).trim(),
                        language: ''
                    };
                } );
                if( index < chapterPageLinks.length - 1 ) {
                    return this._getChapterListFromPages( manga, chapterPageLinks, index + 1 )
                        .then( chapters => chapterList.concat( chapters ) );
                } else {
                    return Promise.resolve( chapterList );
                }
            } );
    }

    /**
     *
     */
    _getChapterList( manga, callback ) {
        let uri = new URL( manga.id, this.url );
        uri.searchParams.set( 'page', 999 );
        let request = new Request( uri.href, this.requestOptions );
        this.fetchDOM( request, 'div#content div.paginate div.page_wrap .page:last-child em.num_page' )
            .then( data => {
                let pageCount = parseInt( data[0].innerText.trim() );
                let pageLinks = [... new Array( pageCount ).keys()].map( page => {
                    uri.searchParams.set( 'page', page + 1 );
                    return uri.href;
                } );
                return this._getChapterListFromPages( manga, pageLinks );
            } )
            .then( data => {
                callback( null, data );
            } )
            .catch( error => {
                console.error( error, manga );
                callback( error, undefined );
            } );
    }

    /**
     *
     */
    _getPageList( manga, chapter, callback ) {
        let request = new Request( this.url + chapter.id, this.requestOptions );
        this.fetchDOM( request, 'div#comic_view_area div.wt_viewer source[id^="content_image"]' )
            .then( data => {
                let pageList = data.map( element => this.getAbsolutePath( element, request.url ) );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}