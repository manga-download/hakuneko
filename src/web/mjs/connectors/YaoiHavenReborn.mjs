import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class YaoiHavenReborn extends Connector {

    constructor() {
        super();
        super.id = 'yaoihavenreborn';
        super.label = 'Yaoi Haven Reborn';
        this.tags = [ 'hentai', 'english' ];
        this.url = 'https://www.yaoihavenreborn.com/';
    }

    async _getMangaFromURI(uri) {
        if(uri.pathname.startsWith('/doujinshi')) {
            let request = new Request(uri, this.requestOptions);
            let data = await this.fetchDOM(request, 'div.container div.card h4.card-header b', 3);
            let id = uri.pathname + uri.search;
            let title = data[0].innerText.trim();
            return new Manga(this, id, title);
        } else {
            throw new Error('Only doujins are supported, galleries cannot be downloaded!');
        }
    }

    /**
     *
     */
    _getMangaListFromPages( mangaPageLinks, index ) {
        index = index || 0;
        let request = new Request( mangaPageLinks[ index ], this.requestOptions );
        return this.fetchDOM( request, 'div.container div.card-body div.row div.card div.card-header a', 5 )
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
        let request = new Request( this.url + '/doujinshi/all-doujinshi?page=', this.requestOptions );
        this.fetchDOM( request, 'div.container div.card-header nav.navigation ul.pagination li.page-item a:not([rel])' )
            .then( data => {
                let pageCount = parseInt( data.pop().text.trim() );
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
        let request = new Request( this.url + manga.id, this.requestOptions );
        this.fetchDOM( request.url, 'div.container div.card-body source.img-fluid' )
            .then( data => {
                let pageList = data.map( element => this.getAbsolutePath( element.dataset[ 'src' ] || element, request.url ) );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}