import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class MangaForAll extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangaforall';
        super.label = 'MangaForAll';
        this.tags = [];
        this.url = 'https://mangaforall.com';
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