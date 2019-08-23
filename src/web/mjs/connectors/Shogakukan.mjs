import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class Shogakukan extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'shogakukan';
        super.label = 'Shogakukan';
        this.tags = [];
        this.url = 'https://shogakukan.tameshiyo.me';
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