import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Hitomi extends Connector {

    constructor() {
        super();
        super.id = 'hitomi';
        super.label = 'Hitomi';
        this.tags = [ 'hentai', 'english' ];
        this.url = 'https://hitomi.la';
        this.requestOptions.headers.set( 'x-referer', this.url );
    }

    async _getMangaFromURI(uri) {
        if(uri.pathname.startsWith('/galleries')) {
            let request = new Request(uri, this.requestOptions);
            let data = await this.fetchDOM(request, 'div.gallery h1 a', 3);
            let id = uri.pathname.match(/(\d+)\.html$/)[1];
            let title = data[0].text.trim();
            return new Manga(this, id, title);
        } else {
            throw new Error('Only direct manga (gallery) links are supported by ' + this.label);
        }
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
        try {
            let chapterList = [ {
                id: manga.id,
                title: manga.title,
                language: ''
            } ];
            callback( null, chapterList );
        } catch( error ) {
            console.error( error, manga );
            callback( error, undefined );
        }
    }

    /**
     *
     */
    _getPageList( manga, chapter, callback ) {
        let request = new Request( `${ this.url }/reader/${ chapter.id }.html`, this.requestOptions );
        Engine.Request.fetchUI( request, 'images' )
            .then( data => {
                let pageList = data.map( image => this.createConnectorURI( this.getAbsolutePath( image.path, request.url ) ) );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}