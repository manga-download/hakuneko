import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class ComicoID extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'comicoid';
        super.label = 'ComicoID';
        this.tags = [];
        this.url = 'http://www.comico.co.id';
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