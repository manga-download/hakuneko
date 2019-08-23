import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class TwistedHelScans extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'twistedhelscans';
        super.label = 'TwistedHelScans';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'http://twistedhelscans.com';
        //this.path        = '/directory/';
        this.language = 'english';

        this.queryMangas = 'div.series_card a';
        this.queryChapters = 'div#staff div.staff_link > a';
    }

    /**
     *
     */
    _getMangaList( callback ) {
        super._getMangaList( ( error, mangas ) => {
            if( !error && mangas instanceof Array ) {
                mangas.forEach( m => {
                    m.title = m.title.replace( /^(ongoing|completed|dropped)/i, '' );
                } );
            }
            callback( error, mangas );
        } );
    }
}