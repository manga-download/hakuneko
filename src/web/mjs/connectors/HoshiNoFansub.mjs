import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class HoshiNoFansub extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'hoshinofansub';
        super.label = 'HoshiNoFansub';
        this.tags = [ 'manga', 'high-quality', 'spanish', 'scanlation' ];
        this.url = 'http://manga.animefrontline.com';
        //this.path        = '/directory/';
        this.language = 'spanish';
    }

    /**
     *
     */
    _getMangaList( callback ) {
        super._getMangaList( ( error, mangas ) => {
            if( !error && mangas instanceof Array ) {
                mangas.forEach( m => {
                    m.title = m.title.replace( /\s*[([](completa|one[\s-]?shot)[\])]\s*$/i, '' );
                } );
            }
            callback( error, mangas );
        } );
    }
}