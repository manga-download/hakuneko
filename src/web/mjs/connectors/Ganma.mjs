import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Ganma extends Connector {

    constructor() {
        super();
        super.id = 'ganma';
        super.label = 'GANMA!';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://ganma.jp';
        this.requestOptions.headers.set( 'x-from', this.url );
    }

    async _getMangaFromURI(uri) {
        let request = new Request(this.url + '/api/2.0/magazines/' + uri.pathname.split('/').pop(), this.requestOptions);
        let data = await this.fetchJSON(request);
        let id = data.root.id; // panel.alias, panel.link
        let title = data.root.title.trim();
        return new Manga(this, id, title);
    }

    /**
     *
     */
    _getMangaList( callback ) {
        let request = new Request( this.url + '/api/2.2/top', this.requestOptions );
        this.fetchJSON( request )
            .then( data => {
                let mangaList = data.root.boxes.reduce( ( accumulator, box ) => {
                    let mangas = box.panels.map( panel => {
                        return {
                            id: panel.id, // panel.alias, panel.link
                            title: panel.title.trim()
                        };
                    } );
                    return accumulator.concat( mangas );
                }, [] );
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
        let request = new Request( this.url + '/api/2.0/magazines/' + manga.id, this.requestOptions );
        this.fetchJSON( request )
            .then( data => {
                let chapterList = data.root.items
                    .filter( chapter => chapter.kind === 'free' )
                    .map( ( chapter, index ) => {
                        return {
                            id: chapter.id,
                            title: ( ( chapter.number || index + 1 ) + ': 【' + chapter.title + '】 ' + chapter.subtitle ).trim(),
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
        let request = new Request( this.url + '/api/2.0/magazines/' + manga.id, this.requestOptions );
        this.fetchJSON( request, 'div#viewer source' )
            .then( data => {
                data = data.root.items.find( item => item.id === chapter.id ).page;
                let pageList = data.files.map( image => this.getAbsolutePath( image + '?' + data.token, data.baseUrl ) );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}