import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class MangaKu extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangaku';
        super.label = 'MangaKu';
        this.tags = [];
        this.url = 'http://mangaku.in';
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