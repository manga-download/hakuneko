import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class SKSubs extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'sksubs';
        super.label = 'SKSubs';
        this.tags = [];
        this.url = 'http://sksubs.com';
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