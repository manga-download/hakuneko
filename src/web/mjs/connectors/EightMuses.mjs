import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class EightMuses extends Connector {

    constructor() {
        super();
        super.id = '8muses';
        super.label = '8muses';
        this.tags = [ 'hentai', 'porn', 'english' ];
        this.url = 'https://www.8muses.com';
        // Private members for internal use that can be configured by the user through settings menu (set to undefined or false to hide from settings menu!)
        this.config = undefined;
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div#top-menu div.top-menu-breadcrumb ol li:nth-of-type(2) a', 3);
        let id = uri.pathname;
        let title = data[0].text.trim();
        return new Manga(this, id, title);
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
        this.fetchDOM( this.url + manga.id, 'div#top-menu div.top-menu-breadcrumb ol li a' )
            .then( data => {
                let chapterList = [ {
                    id: manga.id,
                    title: data.slice(2).map( element => element.text.trim() ).join( ' → ' ),
                    language: ''
                } ];
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
        this.fetchDOM( this.url + manga.id, 'div.gallery div.image source.lazyload' )
            .then( data => {
                let pageList = data.map( element => this.url + element.dataset[ 'src' ].replace( '/th/', '/fl/' ) );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}