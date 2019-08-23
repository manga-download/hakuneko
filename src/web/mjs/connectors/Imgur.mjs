import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class Imgur extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'imgur';
        super.label = 'imgur';
        this.tags = [];
        this.url = 'https://imgur.com';
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