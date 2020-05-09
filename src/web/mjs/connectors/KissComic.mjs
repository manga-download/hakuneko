import Connector from '../engine/Connector.mjs';

export default class KissComic extends Connector {

    constructor() {
        super();
        super.id = 'kisscomic';
        super.label = 'KissComic (ReadComicOnline)';
        this.tags = [ 'comic', 'english' ];
        this.url = 'https://readcomiconline.to';
        this.pageLoadDelay = 5000;
    }

    async _getMangas() {
        let msg = 'This website does not provide a manga list, please copy and paste the URL containing the chapters directly from your browser into HakuNeko.';
        throw new Error(msg);
    }

    _getChapterList( manga, callback ) {
        this.fetchDOM( this.url + manga.id, 'div.episodeList table.listing tr td:first-of-type a, div.section ul.list li a' )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: this.getRelativeLink( element ),
                        title: element.text.replace( /read online/i, '' ).replace( manga.title, '' ).trim(),
                        language: 'en'
                    };
                } );
                callback( null, chapterList );
            } )
            .catch( error => {
                console.error( error, manga );
                callback( error, undefined );
            } );
    }

    _getPageList( manga, chapter, callback ) {
        if( this.isLocked ) {
            console.warn( `[WARN: ${this.label}, too many requests]` );
            callback( new Error( 'Request to ' + this.label + ' has been skipped to prevent the client from beeing blocked for to many requests!' ), [] );
            return;
        }
        let key = this.lock();
        setTimeout( () => {
            this.unlock( key );
        }, this.pageLoadDelay );

        let uri = new URL( chapter.id, this.url );
        uri.searchParams.set('quality', 'hq');
        let request = new Request( uri.href, this.requestOptions );
        Engine.Request.fetchUI( request, 'lstImages' )
            .then( data => {
                let pageList = data.map( link => new URL( link, this.url ).href );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}