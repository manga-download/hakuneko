import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class NineHentai extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = '9hentai';
        super.label = '9hentai';
        this.tags = [];
        this.url = 'https://9hentai.com';
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