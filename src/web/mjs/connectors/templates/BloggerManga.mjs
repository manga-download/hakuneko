import Connector from '../../engine/Connector.mjs';
import Manga from '../../engine/Manga.mjs';

export default class BloggerManga extends Connector {

    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.url = undefined;

        this.path = '/page';
        this.feed = 'summary';
        this.queryMangaTitleRemove = 'Bahasa Indonesia';
        this.queryMangasPerPage = 20;
        this.queryMangasPageCount = 'div#main div#blog-pager span.showpageNum:nth-last-of-type(2) a';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'meta[property="og:title"]');
        let id = uri.pathname + uri.search;
        let title = data[0].content.replace(this.queryMangaTitleRemove, '').trim();
        return new Manga(this, id, title);
    }

    /**
     *
     */
    _getMangaListFromPages( mangaPageLinks, index ) {
        index = index || 0;
        let request = new Request( mangaPageLinks[ index ], this.requestOptions );
        return this.fetchJSON( request )
            .then( data => {
                let mangaList = data.feed.entry.map( entry => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( entry.link.find( a => a.rel === 'alternate' ).href, request.url ),
                        title: entry.title.$t.replace( this.queryMangaTitleRemove, '' ).trim()
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
        let script = `
        new Promise( resolve => {
            let result = document.querySelector( '${this.queryMangasPageCount}' );
            resolve( result.textContent.trim() );
        } );
        `;
        let request = new Request( this.url + this.path, this.requestOptions );
        Engine.Request.fetchUI( request, script )
            .then( data => {
                let pageCount = parseInt( data );
                let pageLinks = [... new Array( pageCount ).keys()].map( page => this.url + `/feeds/posts/${this.feed}?alt=json&max-results=${this.queryMangasPerPage}&start-index=` + ( this.queryMangasPerPage * page + 1 ) );
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
}