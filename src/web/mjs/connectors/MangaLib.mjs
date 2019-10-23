import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaLib extends Connector {

    constructor() {
        super();
        super.id = 'mangalib';
        super.label = 'MangaLib';
        this.tags = [ 'manga', 'webtoon', 'russian' ];
        this.url = 'https://mangalib.me';
        this.imgCDN = 'https://img2.mangalib.me'; // img1 (main), img2 (secondary/CDN)
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'meta[itemprop="alternativeHeadline"]');
        let id = uri.pathname + uri.search;
        let title = data[0].content.trim();
        return new Manga(this, id, title);
    }

    /**
     *
     */
    _getMangaListFromPages( token, page ) {
        page = page || 1;
        this.requestOptions.method = 'POST';
        let request = new Request( this.url + '/filterlist?dir=desc&page=' + page, this.requestOptions );
        request.headers.set( 'x-csrf-token', token );
        this.requestOptions.method = 'GET';
        return this.fetchJSON( request )
            .then( data => {
                let mangaList = data.items.data.map( item => {
                    return {
                        id: '/' + item.slug,
                        title: item.name // name, rus_name
                    };
                } );
                // currently MangaLib seems to be capped at page 20 (1200 mangas)
                if( data.items.current_page === page ) {
                    return this._getMangaListFromPages( token, page + 1 )
                        .then( mangas => mangaList.concat( mangas ) );
                } else {
                    return Promise.resolve( mangaList );
                }
            } );
    }

    /**
     *
     */
    _getMangaList( callback ) {
        let request = new Request( this.url + '/manga-list', this.requestOptions );
        this.fetchDOM( request, 'meta[name="_token"]' )
            .then( data => this._getMangaListFromPages( data[0].content ) )
            .then( data => {
                callback( null, data );
            } )
            .catch( error => {
                console.error( error, this );
                callback( error, undefined );
            } );
    }

    /**
     *
     */
    _getChapterList( manga, callback ) {
        let request = new Request( this.url + manga.id, this.requestOptions );
        this.fetchDOM( request, 'div.chapters-list div.chapter-item div.chapter-item__name a' )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
                        title: element.text.replace( manga.title, '' ).trim(),
                        language: 'ru'
                    };
                } );
                callback( null, chapterList );
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
        let pageList = [];
        let request = new Request( this.url + chapter.id, this.requestOptions );
        this.fetchDOM( request, 'span.pp' )
            .then( data => {
                data = [...data[0].childNodes].find( node => node.nodeType === Node.COMMENT_NODE );
                data = JSON.parse( decodeURIComponent( escape( atob( data.textContent ) ) ) );
                pageList = data.map( page => page.u );
                return Engine.Request.fetchUI( request, `window.__info.imgUrl` );
            } )
            .then( data => {
                pageList = pageList.map( page => this.getAbsolutePath( data + page, this.imgCDN ) );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}