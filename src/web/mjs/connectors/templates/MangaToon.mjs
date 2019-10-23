import Connector from '../../engine/Connector.mjs';
import Manga from '../../engine/Manga.mjs';

export default class MangaToon extends Connector {

    constructor() {
        super();
        super.id = 'mangatoon';
        super.label = 'MangaToon';
        this.tags = [];
        this.url = undefined; // WEEX + VUE mobile app => https://h5.mangatoon.mobi
        this.baseURL = 'https://mangatoon.mobi';
        this.path = undefined;

        this.lockImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMTAwIiB3aWR0aD0iMjAwIj48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZHk9IjAuMjVlbSIgZmlsbD0icmVkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5DaGFwdGVyIGlzIExvY2tlZCE8L3RleHQ+PC9zdmc+';
    }

    /**
     *
     */
    get icon() {
        return '/img/connectors/mangatoon';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.detail-top h1.comics-title', 3);
        let id = uri.pathname.replace('/episodes', '');
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    /**
     *
     */
    _getMangaListFromPages( mangaPageLinks, index ) {
        index = index || 0;
        return this.fetchDOM( mangaPageLinks[ index ], 'div.items div.item div.content-title', 5 )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRelativeLink( element.closest( 'a' ) ),
                        title: element.innerText.trim()
                    };
                } );
                if( mangaList.length > 0 && index < mangaPageLinks.length - 1 ) {
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
        this.fetchDOM( this.baseURL + this.path, 'div.page div.next' )
            .then( () => {
                let pageCount = 999;
                let pageLinks = [... new Array( pageCount ).keys()].map( page => this.baseURL + this.path + page );
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
        /*
         * Alternative mobile request (id, token and signature calculations are all handled within the WEEX + VUE application => to much effort to break in):
         * https://sg.mangatoon.mobi/api/content/episodes?sign=e9da6de28b76408e77040935fd221cd3&id=5&_=1557650222&_v=1.3.6&_language=en&_token=4f9b604ed0055dd569105a7b32b6489c10&_udid=1246361632e50c7a9daef1e187471778
         */
        this.fetchDOM( this.baseURL + manga.id + '/episodes', 'div.episodes-wrap a.episode-item' )
            .then( data => {
                let chapterList = data.map( element => {
                    //let number = element.querySelector( 'div.item-left' ).innerText.trim();
                    let title = element.querySelector( 'div.item-right div.episode-title' ).innerText.trim();
                    return {
                        id: this.getRelativeLink( element ),
                        title: title.replace( manga.title, '' ).trim(),
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
        let request = new Request( this.baseURL + chapter.id, this.requestOptions );
        fetch( request )
            .then( response => response.text() )
            .then( data => {
                let pageList = [ this.lockImage ];
                let pictures = data.match( /pictures\s*=\s*(\[.+?\])\s*;/ );
                if( pictures ) {
                    pictures = JSON.parse( pictures[1] );
                    pageList = pictures.map( picture => {
                        let parts = picture.url.replace( '/encrypted/', '/watermark/' ).split( '.' );
                        parts[parts.length-1] = 'jpg';
                        return this.getAbsolutePath( parts.join( '.' ), request.url );
                    } );
                }
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}