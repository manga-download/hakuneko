import Connector from '../engine/Connector.mjs';

export default class UnionMangas extends Connector {

    constructor() {
        super();
        super.id = 'unionmangas';
        super.label = 'UnionMangas';
        this.tags = [ 'manga', 'portuguese' ];
        this.url = 'https://unionleitor.top';
    }

    _getMangaListFromPages( mangaPageLinks, index ) {
        if( index === undefined ) {
            index = 0;
        }
        return this.wait( 0 )
            .then ( () => this.fetchDOM( mangaPageLinks[ index ], 'div.bloco-manga a:nth-of-type(2)', 5 ) )
            .then( data => {
                let mangaList = data.map( element => {
                    this.cfMailDecrypt( element );
                    return {
                        id: this.getRelativeLink( element ),
                        title: element.text.trim()
                    };
                } );
                if( index < mangaPageLinks.length - 1 ) {
                    return this._getMangaListFromPages( mangaPageLinks, index + 1 )
                        .then( mangas => mangas.concat( mangaList ) );
                } else {
                    return Promise.resolve( mangaList );
                }
            } );
    }

    _getMangaList( callback ) {
        this.fetchDOM( this.url + '/mangas/visualizacoes', 'nav ul.pagination li:last-of-type a' )
            .then( data => {
                let pageCount = parseInt( data[0].href.match(/(\d+)$/)[1] );
                let pageLinks = [... new Array( pageCount ).keys()].map( page => this.url + '/mangas/visualizacoes/' + ( page + 1 ) );
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

    _getChapterList( manga, callback ) {
        let uri = new URL(manga.id, this.url);
        let request = new Request(uri, this.requestOptions);
        this.fetchDOM(request, 'div.row.lancamento-linha div:first-of-type a:first-of-type' )
            .then( data => {
                let chapterList = data.map( element => {
                    this.cfMailDecrypt( element );
                    return {
                        id: this.getRelativeLink( element ),
                        title: element.text.trim(),
                        language: 'pt'
                    };
                } );
                callback( null, chapterList );
            } )
            .catch( error => {
                console.error( error, manga );
                callback( error, undefined );
            } );
    }

    _getPageList( manga, chapter, callback ) {
        let uri = new URL(chapter.id, this.url);
        let request = new Request(uri, this.requestOptions);
        this.fetchDOM(request, 'source[pag]')
            .then( data => {
                let pageList = data.map( element => {
                    let uri = new URL( element.src );
                    uri.protocol = new URL( this.url ).protocol;
                    return uri.href;
                } );
                pageList = pageList.filter( page => {
                    return page.indexOf( 'banner' ) < 0 ;
                } );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}