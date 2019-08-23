import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class MuchoHentai extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'muchohentai';
        super.label = 'MuchoHentai';
        this.tags = [ 'anime', 'hentai', 'multi-lingual' ];
        this.url = 'https://muchohentai.com';
    }

    /**
     *
     */
    _getMangaList( callback ) {
        let request = new Request( this.url + '/hentai-series-list/', this.requestOptions );
        this.fetchDOM( request, 'div.page-content ul.links li a' )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
                        title: element.text.trim()
                    };
                } );
                callback( null, mangaList );
            } )
            .catch( error => {
                console.error( error, this );
                callback( error, undefined );
            } );
    }

    /**
     *
     */
    _getChapterList( manga, callback ) {
        let request = new Request( this.url + manga.id, this.requestOptions );
        this.fetchDOM( request, 'div.item-video div.data h2.entry-title a' )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
                        title: element.text.replace( manga.title, '' ).trim(),
                        language: ''
                    };
                } );
                callback( null, chapterList );
            } )
            .catch( error => {
                console.error( error, manga );
                callback( error, undefined );
            } );
    }

    /**
     *
     */
    _getPageList( manga, chapter, callback ) {
        let request = new Request( this.url + chapter.id, this.requestOptions );
        Engine.Request.fetchUI( request, `files` )
            .then( data => {
                let streamMP4 = data.find( file => file.type === 'mp4' );
                if( streamMP4 ) {
                    streamMP4 = { video: streamMP4.file, subtitles: [] };
                }
                let streamHLS = data.find( file => file.type === 'hls' );
                if( streamHLS ) {
                    streamHLS = { hash: 'id,language,resolution', mirrors: [ streamHLS.file ], subtitles: [] };
                }
                /*
                 * TODO: prefer MP4 over HLS as soon as HakuNeko 5.x.x is released,
                 * because header length requests will be supported even if CORS prohibits length header
                 */
                let media = streamHLS || streamMP4;
                if( !media ) {
                    throw new Error( 'No supported video stream found!' );
                }
                callback( null, media );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}