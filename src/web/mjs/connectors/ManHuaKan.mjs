import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ManHuaKan extends Connector {

    constructor() {
        super();
        super.id = 'manhuakan';
        super.label = '漫画看 (MHKAN)';
        this.tags = [ 'webtoon', 'chinese' ];
        this.url = 'https://www.mhkan.com';

        // prevent cover images from loading to speed up fetchUI
        Engine.Blacklist.addPattern( '*://res.mhkan.com/images/cover*' );
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.comic-view div.book-cont div.book-detail div.book-title h1 span');
        let id = uri.pathname + uri.search;
        let title = data[0].innerText.trim();
        return new Manga(this, id, title);
    }

    /**
     *
     */
    _getMangaListFromPages( mangaPageLinks, index ) {
        index = index || 0;
        let request = new Request( mangaPageLinks[ index ], this.requestOptions );
        return this.fetchDOM( request, 'div.page-main ul#contList li.item-lg p.ell a', 5 )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
                        title: element.text.trim()
                    };
                } );
                if( index < mangaPageLinks.length - 1 ) {
                    return this._getMangaListFromPages( mangaPageLinks, index + 1 )
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
        let request = new Request( this.url + '/list/', this.requestOptions );
        this.fetchDOM( request, 'div.page-container ul.pagination li.last a' )
            .then( data => {
                let pageCount = parseInt( data[0].dataset.page.trim() );
                let pageLinks = [... new Array( pageCount ).keys()].map( page => this.url + '/list_' + ( page + 1 ) + '/' );
                return this._getMangaListFromPages( pageLinks );
            } )
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
        this.fetchDOM( request, 'div#chapters div.comic-chapters div.chapter-body ul li a' )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
                        title: element.text.replace( manga.title, '' ).trim(),
                        language: ''
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
        let request = new Request( this.url + chapter.id, this.requestOptions );
        let script = `Promise.resolve( chapterImages.map( image => image.includes(':') ? image : SinConf.resHost[0].domain[0] + '/' + chapterPath + image ) );`;
        Engine.Request.fetchUI( request, script )
            .then( data => {
                let pageList = data;
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}