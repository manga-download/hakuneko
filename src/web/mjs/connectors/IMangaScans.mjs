import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class IMangaScans extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'imangascans';
        super.label = 'IMangaScans';
        this.tags = [];
        this.url = 'https://reader.imangascans.org';
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