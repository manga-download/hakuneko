import Connector from '../../engine/Connector.mjs';

export default class LineWebtoon extends Connector {

    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.tags = [];
        this.url = undefined;
        this.baseURL = 'https://www.webtoons.com';
        this.requestOptions.headers.set( 'x-referer', this.baseURL );
    }

    /**
     *
     */
    get icon() {
        return '/img/connectors/linewebtoon';
    }

    /**
     * Overwrite base function to get manga from clipboard link.
     */
    _getMangaFromURI( uri ) {
        //return this.fetchDOM( uri.href, 'div.cont_box div.detail_header div.info .subj', 3 )
        return this.fetchDOM( uri.href, 'head meta[property="og:title"]', 3 )
            .then( data => {
                let id = uri.pathname + uri.search;
                let title = data[0].content.trim();
                return Promise.resolve( new Manga( this, id, title ) );
            } );
    }

    /**
     *
     */
    _getMangaList( callback ) {
        this.fetchJSON( 'http://cdn.hakuneko.download/' + this.id + '/mangas.json', 3 )
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
    _getChapterListFromPages( manga, lastAdded, index ) {
        lastAdded = lastAdded || [];
        index = index || 1;
        return this.wait( 0 )
            .then ( () => this.fetchDOM( this.baseURL + manga.id + '&page=' + index, 'div.detail_body div.detail_lst ul li > a', 5 ) )
            .then( data => {
                let chapterList = data.map( element => {
                    let title = element.querySelector( 'span.tx' ).textContent.trim();
                    title += ' - ' + element.querySelector( 'span.subj span' ).textContent.trim();
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, this.baseURL ),
                        title: title,
                        language: 'en'
                    };
                } ).filter( chapter => !lastAdded.find( old => old.id === chapter.id ) );
                if( chapterList.length > 0 ) {
                    return this._getChapterListFromPages( manga, chapterList, index + 1 )
                        .then( chapters => chapters.concat( chapterList ) );
                } else {
                    return Promise.resolve( chapterList );
                }
            } );
    }

    /**
     *
     */
    _getChapterList( manga, callback ) {
        this._getChapterListFromPages( manga )
            .then( data => {
                callback( null, data );
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
        let request = new Request( this.baseURL + chapter.id, this.requestOptions );
        this.fetchDOM( request, 'div.viewer div.viewer_lst div.viewer_img source[data-url]' )
            .then( data => {
                let pageList = data.map( element => this.createConnectorURI( this.getAbsolutePath( element.dataset.url, request.url ) ) );
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
        return fetch( request )
            .then( response => response.blob() )
            .then( data => this._blobToBuffer( data ) );
    }
}