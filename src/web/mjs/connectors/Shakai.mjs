import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class Shakai extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'shakai';
        super.label = 'Shakai';
        this.tags = [];
        this.url = 'http://shakai.ru';
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