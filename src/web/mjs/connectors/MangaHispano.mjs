import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class MangaHispano extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangahispano';
        super.label = 'MangaHispano';
        this.tags = [];
        this.url = 'https://mangahis.com';
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