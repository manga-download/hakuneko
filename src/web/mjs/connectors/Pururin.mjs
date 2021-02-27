import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class Pururin extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'pururin';
        super.label = 'Pururin';
        this.tags = [];
        this.url = 'https://pururin.io';
        this.links = {
            login: 'https://pururin.io/login'
        };
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