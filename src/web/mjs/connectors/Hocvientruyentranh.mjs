import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class AcademyVN extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'academyvn';
        super.label = 'AcademyVN';
        this.tags = [];
        this.url = 'https://hocvientruyentranh.net';
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