import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class DangolineNoFansub extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'dangolinenofansub';
        super.label = 'DangolineNoFansub';
        this.tags = [ 'manga', 'high-quality', 'spanish', 'scanlation' ];
        this.url = 'http://lector.dangolinenofansub.com';
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
                    m.title = m.title.replace( /\s+\|\s+.*/, '' );
                } );
            }
            callback( error, mangas );
        } );
    }
}