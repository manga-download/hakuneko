import Connector from '../engine/Connector.mjs';

export default class SpotToon extends Connector {

    constructor() {
        super();
        super.id = 'spottoon';
        super.label = 'Spottoon';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://www.spottoon.com';

        // prevent broken String.startsWith() and String.endsWith() implementations which leads to electron errors in fetchUI
        Engine.Blacklist.addPattern( '*://www.spottoon.com/static/js/front-util.js' );
    }

    _getMangaList( callback ) {
        callback( new Error( 'Not implemented!' ), undefined );
    }

    _getChapterList( manga, callback ) {
        callback( new Error( 'Not implemented!' ), undefined );
    }

    _getPageList( manga, chapter, callback ) {
        callback( new Error( 'Not implemented!' ), undefined );
    }
}