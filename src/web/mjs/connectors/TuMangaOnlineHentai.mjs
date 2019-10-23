import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class TuMangaOnlineHentai extends Connector {

    constructor() {
        super();
        super.id = 'tumangaonlinehentai';
        super.label = 'TMOHentai';
        this.tags = [ 'hentai', 'spanish' ];
        this.url = 'https://tmohentai.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.panel-title div.panel-heading h3.truncate');
        let id = uri.pathname.split('/').pop();
        let title = data[0].innerText.trim();
        return new Manga(this, id, title);
    }

    /**
     *
     */
    _getMangaListFromPages( mangaPageLinks, index ) {
        index = index || 0;
        let request = new Request( mangaPageLinks[ index ], this.requestOptions );
        return this.fetchDOM( request, 'div.panel-body table.table tbody tr td.text-left a', 5 )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: element.href.split( '/' ).pop(),
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
        let request = new Request( this.url + '/section/all?view=list&order=alphabetic&page=', this.requestOptions );
        this.fetchDOM( request, 'div.panel-body ul.pagination li:nth-last-of-type(2) a' )
            .then( data => {
                let pageCount = parseInt( data[0].text.trim() );
                let pageLinks = [... new Array( pageCount ).keys()].map( page => request.url + ( page + 1 ) );
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
        Promise.resolve()
            .then( () => {
                let chapterList = [ {
                    id: manga.id,
                    title: manga.title,
                    language: ''
                } ];
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
        let request = new Request( `${this.url}/reader/${chapter.id}/cascade`, this.requestOptions );
        this.fetchDOM( request, 'div#content-images source.content-image' )
            .then( data => {
                let pageList = data.map( element => this.getAbsolutePath( element.dataset['original'] || element, request.url ) );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}