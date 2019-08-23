import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class ReadMangaEU extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'readmangaeu';
        super.label = 'ReadMangaEU';
        this.tags = [];
        this.url = 'http://www.readmanga.eu';
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