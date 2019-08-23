import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class VNSharing extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'vnsharing';
        super.label = 'VNSharing';
        this.tags = [];
        this.url = 'http://truyen.vnsharing.site';
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