import Connector from '../engine/Connector.mjs';

export default class MangaHost extends Connector {

    constructor() {
        super();
        super.id = 'mangahost';
        super.label = 'MangaHost';
        this.tags = [ 'manga', 'portuguese' ];
        this.url = 'https://mangahost2.com';
    }

    _getMangaListFromPages( mangaPageLinks, index ) {
        if( index === undefined ) {
            index = 0;
        }
        return this.wait( 0 )
            .then ( () => this.fetchDOM( mangaPageLinks[ index ], 'div#page div.thumbnail h3 a', 5 ) )
            .then( data => {
                let mangaList = data.map( element => {
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
        this.fetchDOM( this.url + '/mangas', 'div.paginador div.wp-pagenavi a.last' )
            .then( data => {
                let pageCount = parseInt( data[0].href.match( /(\d+)$/ )[1] );
                let pageLinks = [... new Array( pageCount ).keys()].map( page => this.url + '/mangas/page/' + ( page + 1 ) );
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
        this.fetchDOM( this.url + manga.id, 'ul.list_chapters li a[data-original-title]' )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: [manga.id, element.id].join('/'),
                        title: element.dataset.originalTitle.replace( manga.title, '' ).replace( /\s+-\s*$/, '' ).trim(),
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
        let request = new Request(this.url + chapter.id, this.requestOptions);
        this.fetchRegex(request, /<img\s+id='img_\d+'\s+src='(.*?)'/g)
            .then( data => {
                callback( null, data );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}