import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class MangaShow extends Connector {

    /**
     * Maybe siilar to 11toon?
     */
    constructor() {
        super();
        super.id = 'mangashow';
        super.label = 'MangaShow';
        this.tags = [];
        // TODO: website seems to be not reachable anymore ...
        this.url = 'https://mangashow.me';
    }

    _getMangaList( callback ) {
        callback( new Error( 'Please report this broken website on HakuNeko\'s GitHub project page.' ), undefined );
    }
    _getChapterList( manga, callback ) {
        callback( new Error( 'Please report this broken website on HakuNeko\'s GitHub project page.' ), undefined );
    }
    _getPageList( manga, chapter, callback ) {
        callback( new Error( 'Please report this broken website on HakuNeko\'s GitHub project page.' ), undefined );
    }
}