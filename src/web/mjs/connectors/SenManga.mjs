import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class SenManga extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'senmanga';
        super.label = 'SenManga';
        this.tags = [];
        this.url = 'http://www.senmanga.com';
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