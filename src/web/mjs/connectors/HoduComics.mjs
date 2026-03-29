import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class HoduComics extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'hoducomics';
        super.label = 'HoduComics';
        this.tags = [];
        this.url = 'https://hoducomics.com';
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