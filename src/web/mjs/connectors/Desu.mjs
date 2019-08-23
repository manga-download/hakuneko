import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class Desu extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'desu';
        super.label = 'Desu';
        this.tags = [];
        this.url = 'https://desu.me';
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