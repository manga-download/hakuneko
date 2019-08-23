import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class SundayWebry extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'sundaywebry';
        super.label = 'SundayWebry';
        this.tags = [];
        this.url = 'https://www.sunday-webry.com';
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