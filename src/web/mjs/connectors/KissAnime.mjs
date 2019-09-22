import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class KissAnime extends Connector {

    constructor() {
        super();
        super.id = 'kissanime';
        super.label = 'KissAnime';
        this.tags = [ 'anime', 'english' ];
        super.isLocked = false;
        this.url = 'https://kissanime.ru';
        this.pageLoadDelay = 5000;
        // Private members for internal use that can be configured by the user through settings menu (set to undefined or false to hide from settings menu!)
        this.config = {
            resolution:  {
                label: 'Preferred Resolution',
                description: 'Try to download video in the selected resolution.\nIf the resolution is not supported, depending on the mirror the download may fail, or a fallback resolution may be used!',
                input: 'select',
                options: [
                    { value: '', name: 'Mirror\'s Default' },
                    { value: '480', name: '480p' },
                    { value: '720', name: '720p' },
                    { value: '1080', name: '1080p' }
                ],
                value: ''
            }
        };
    }

    /**
     * Overwrite base function to get manga from clipboard link.
     */
    async _getMangaFromURI(uri) {
        try {
            let data = await this.fetchDOM(uri.href, 'div#container div.barContent a.bigChar', 3);
            let id = uri.pathname;
            let title = data[0].text.trim();
            return Promise.resolve(new Manga(this, id, title));
        } catch(error) {
            return null;
        }
    }

    async _getMangaList(callback) {
        try {
            let data = await this.fetchJSON('http://cdn.hakuneko.download/' + this.id + '/mangas.json', 3);
            callback(null, data);
        } catch(error) {
            console.error(error, this);
            callback(error, undefined);
        }
    }

    async _getChapterList(manga, callback) {
        try {
            let request = new Request(this.url + manga.id, this.requestOptions);
            let data = await this.fetchDOM(request, 'div.episodeList table.listing tr td:first-of-type a');
            let chapterList = data.map( element => {
                return {
                    id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                    title: element.text.replace(manga.title, '').trim() + ' [RapidVideo]',
                    language: ''
                };
            } );
            callback( null, chapterList );
        } catch(error) {
            console.error(error, manga);
            callback(error, undefined);
        }
    }

    /**
     *
     */
    _getPageList( manga, chapter, callback ) {
        if( this.isLocked ) {
            console.warn( `[WARN: ${this.label}, too many requests]` );
            callback( new Error( 'Request to ' + this.label + ' has been skipped to prevent the client from being blocked for to many requests!' ), [] );
            return;
        }
        let key = this.lock();
        setTimeout( () => {
            this.unlock( key );
        }, this.pageLoadDelay );

        let uri = new URL( chapter.id, this.url );
        uri.searchParams.set( 's', 'rapidvideo' );
        let request = new Request( uri.href, this.requestOptions );
        request.headers.set( 'x-referer', this.url );
        fetch( request )
            .then( response => response.text() )
            .then( data => {
                let link = data.match( /src\s*=\s*['"]([^'"]+rapidvid[^'"]+)['"]/ )[1];
                switch(true) {
                case link.includes( 'rapidvid' ):
                    return this._getEpisodeRapidVideo( link, this.config.resolution.value );
                default:
                    throw new Error( 'Support for video stream from mirror "' + link + '" not implemented!' );
                }
            } )
            .then( media => {
                callback( null, media );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }

    /**
     * Same as in 9anime
     */
    _getEpisodeRapidVideo( link, resolution ) {
        let request = new Request( link, this.requestOptions );
        request.headers.set( 'x-cookie', 'q=' + resolution );
        //request.headers.set( 'x-referer', this.url );
        return this.fetchDOM( request, 'video#videojs source' )
            .then( data => {
                if( !data.length ) {
                    throw new Error( `No matching video stream found for requested resolution "${resolution}"!` );
                }
                return Promise.resolve( { video: data[0].src, subtitles: [] } );
            } );
    }
}