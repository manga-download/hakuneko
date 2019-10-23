import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class HentaiNexus extends Connector {

    constructor() {
        super();
        super.id = 'hentainexus';
        super.label = 'HentaiNexus';
        this.tags = [ 'hentai', 'english' ];
        this.url = 'https://hentainexus.com';
    }

    async _getMangaFromURI(uri) {
        let path = uri.pathname.split('/').slice(0, 3);
        path[1] = 'view';
        uri.pathname = path.join('/');
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.box div.column h1.title');
        let id = uri.pathname;
        let title = data[0].innerText.trim();
        return new Manga( this, id, title);
    }

    /**
     *
     */
    _getMangaListFromPages( mangaPageLinks, index ) {
        index = index || 0;
        let request = new Request( mangaPageLinks[ index ], this.requestOptions );
        return this.fetchDOM( request, 'div.columns div.column a div.card header.card-header', 5 )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element.closest( 'a' ), request.url ),
                        title: element.title.trim()
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
        let request = new Request( this.url, this.requestOptions );
        this.fetchDOM( request, 'nav.pagination ul.pagination-list li:last-of-type a.pagination-link' )
            .then( data => {
                let pageCount = parseInt( data[0].text.trim() );
                let pageLinks = [... new Array( pageCount ).keys()].map( page => this.url + '/page/' + ( page + 1 ) );
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
        try {
            let chapterList = [
                {
                    id: manga.id.replace( 'view/', 'read/' ),
                    title: manga.title,
                    language: ''
                }
            ];
            callback( null, chapterList );
        } catch ( error ) {
            console.error( error, manga );
            callback( error, undefined );
        }
    }

    /**
     *
     */
    _getPageList( manga, chapter, callback ) {
        let request = new Request( this.url + chapter.id, this.requestOptions );
        Engine.Request.fetchUI( request, `pageData;` )
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