import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class PervEdenIT extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'perveden-it';
        super.label = 'PervEdenIT';
        this.tags = [];
        this.url = 'https://www.perveden.com';
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