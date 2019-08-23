import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class Madokami extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'madokami';
        super.label = 'Madokami';
        this.tags = [];
        this.url = 'https://manga.madokami.al';
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