import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class MangaOnline extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangaonline';
        super.label = 'MangaOnline';
        this.tags = [];
        this.url = 'https://manga-online.biz';
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