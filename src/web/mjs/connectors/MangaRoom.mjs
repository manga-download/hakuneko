import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class MangaRoom extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangaroom';
        super.label = 'MangaRoom';
        this.tags = [];
        this.url = 'http://manga-room.com';
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