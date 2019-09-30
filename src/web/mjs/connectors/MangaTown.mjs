import Connector from '../engine/Connector.mjs';

/**
 * @author Neogeek
 */
export default class MangaTown extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangatown';
        super.label = 'MangaTown';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://www.mangatown.com';
        this.reqOptionsJSON = JSON.stringify( {
            url: this.url,
            gzip: true,
            rejectUnauthorized: false // ignore broken https certificate chain from mangatown
        } );
    }

    /**
     *
     */
    _getMangaListFromPages( mangaPageLinks, index ) {
        if( index === undefined ) {
            index = 0;
        }
        return this.wait( 0 )
            .then ( () => this.fetchDOM( mangaPageLinks[ index ], 'ul.manga_pic_list li p.title a', 5 ) )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRelativeLink( element ),
                        title: element.title.trim()
                    };
                } );
                if( index < mangaPageLinks.length - 1 ) {
                    return this._getMangaListFromPages( mangaPageLinks, index + 1 )
                        .then( mangas => mangas.concat( mangaList ) );
                } else {
                    return Promise.resolve( mangaList );
                }
            } );
    }

    /**
     *
     */
    _getMangaList( callback ) {
        this.fetchDOM( this.url + '/directory/', 'div.next-page a:nth-last-child(3)' )
            .then( data => {
                let pageCount = parseInt( data[0].text.trim() );
                let pageLinks = [... new Array( pageCount ).keys()].map( page => this.url + '/directory/0-0-0-0-0-0/' + ( page + 1 ) + '.htm' );
                return this._getMangaListFromPages( pageLinks );
            } )
            .then( data => {
                callback( null, data );
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
        this.fetchDOM( this.url + manga.id, 'ul.chapter_list li' )
            .then( data => {
                let chapterList = data.map( element => {
                    let link = element.getElementsByTagName( 'a' )[0];
                    let title = link.text.replace( manga.title, '' ).trim();
                    let texts = element.getElementsByTagName( 'span' );
                    for( let i = 0; i < texts.length; i++ ) {
                        if( texts[i].getAttribute( 'class' ) != 'time' ) {
                            if( texts[i].textContent.match( /^Vol \d+/i ) ) {
                                title = '[' + texts[i].textContent + '] ' + title;
                            } else {
                                title = title + ' ' + texts[i].textContent;
                            }
                        }
                    }
                    return {
                        id: this.getRelativeLink( link ),
                        title: title,
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

    /**
     *
     */
    _getPageList( manga, chapter, callback ) {
        let request = new Request( this.getAbsolutePath( chapter.id, this.url ), this.requestOptions );
        this.fetchDOM( request, 'div.manga_read_footer div.page_select select option' )
            .then( data => {
                let pageList = data
                    .map( element => this.createConnectorURI( this.getAbsolutePath( element.value, request.url ) ) )
                    .filter( page => !page.endsWith( 'featured.html' ) );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }

    /**
     *
     */
    _handleConnectorURI( payload ) {
        let request = new Request( payload, this.requestOptions );
        /*
         * TODO: only perform requests when from download manager
         * or when from browser for preview and selected chapter matches
         */
        return this.fetchDOM( request, 'source#image' )
            .then( data => super._handleConnectorURI( this.getAbsolutePath( data[0], request.url ) ) );
    }
}