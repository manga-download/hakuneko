import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class NHentai extends Connector {

    constructor() {
        super();
        super.id = 'nhentai';
        super.label = 'NHentai';
        this.tags = [ 'hentai' ];
        this.url = 'https://nhentai.net';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div#info-block div#info h1');
        let id = uri.pathname + uri.search;
        let title = data[0].innerText.trim();
        return new Manga( this, id, title);
    }

    /**
     *
     */
    _getMangaList( callback ) {
        let msg = 'This website does not provide a manga list, please copy and paste the URL containing the images directly from your browser into HakuNeko.';
        callback( new Error( msg ), undefined );
    }

    /**
     *
     */
    _getChapterList( manga, callback ) {
        Promise.resolve()
            .then( () => {
                callback( null, [ Object.assign( { language: '' }, manga ) ] );
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
        this.fetchDOM( request, 'div#thumbnail-container a.gallerythumb source' )
            .then( data => {
                let pageList = data.map( element => element.dataset['src'].replace( 't.', 'i.' ).replace( 't.', '.' ) );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}