import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class Niadd extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'niadd';
        super.label = 'Niadd';
        this.tags = [];
        this.url = 'https://www.niadd.com';
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