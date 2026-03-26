import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class SoManga extends Connector {

    constructor() {
        super();
        super.id = 'somanga';
        super.label = 'SoManga';
        this.tags = [ 'manga', 'portuguese' ];
        this.url = 'https://somangas.net';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.manga div.col-sm-8 h2', 3);
        let id = uri.pathname + uri.search;
        let title = data[0].innerText.trim();
        return new Manga(this, id, title);
    }

    /**
     *
     */
    _getMangaList( callback ) {
        let msg = 'This website does not provide a manga list, please copy and paste the URL containing the chapters directly from your browser into HakuNeko.';
        callback( new Error( msg ), undefined );
    }

    /**
     *
     */
    _getChapterList( manga, callback ) {
        let request = new Request( this.url + manga.id, this.requestOptions );
        this.fetchDOM( request, 'ul.capitulos li.row > a:first-of-type' )
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
        this.fetchDOM( request, 'div.row source.img-manga' )
            .then( data => {
                let pageList = data.map( element => this.getAbsolutePath( element, request.url ) );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}