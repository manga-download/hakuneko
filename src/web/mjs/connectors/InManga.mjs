import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class InManga extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'inmanga';
        super.label = 'InManga';
        this.tags = [];
        this.url = 'https://inmanga.com';
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