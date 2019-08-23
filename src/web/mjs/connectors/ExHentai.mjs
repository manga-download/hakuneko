import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class ExHentai extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'exhentai';
        super.label = 'ExHentai';
        this.tags = [];
        this.url = 'http://exhentai.org';
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