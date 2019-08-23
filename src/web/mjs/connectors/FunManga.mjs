import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class FunManga extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'funmanga';
        super.label = 'FunManga';
        this.tags = [];
        this.url = 'http://www.funmanga.com';
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