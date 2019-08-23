import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class AtelierDuNoir extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'atelierdunoir';
        super.label = 'AtelierDuNoir';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'http://atelierdunoir.org';
        this.path = '/reader/directory/';
        this.language = 'english';

        this.queryMangas = 'div.row div.thumbnail div.caption';
    }

    /**
     *
     */
    _getMangaListFromPages( mangaPageLinks, index ) {
        if( index === undefined ) {
            index = 0;
        }
        return this.wait( 0 )
            .then ( () => this.fetchDOM( mangaPageLinks[ index ], this.queryMangas, 5 ) )
            .then( data => {
                let mangaList = data.map( element => {
                    let title = element.querySelector( 'h4' ).innerText;
                    let a = element.querySelector( 'a' );
                    return {
                        id: this.getRelativeLink( a ),
                        title: title.trim()
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
}