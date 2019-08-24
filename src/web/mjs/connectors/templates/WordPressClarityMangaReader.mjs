import Connector from '../../engine/Connector.mjs';

export default class WordPressClarityMangaReader extends Connector {

    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.url = undefined;

        this.paths = [];
        this.queryMangas = 'a.vc_gitem-link.vc-zone-link';
        this.queryChapters = 'div.chapter-list div.itemlist p.listcap';
        this.queryPages = 'div.page-break source';

        this.formManga = new URLSearchParams();
        this.formManga.set( 'action', 'vc_get_vc_grid_data' );
        //this.formManga.set( 'vc_action', 'vc_get_vc_grid_data' );
        this.formManga.set( 'tag', 'vc_masonry_grid' );
        /*
         *this.formManga.set( 'data[visible_pages]', 5 );
         *this.formManga.set( 'data[style]', 'load-more-masonry' );
         *this.formManga.set( 'data[action]', 'vc_get_vc_grid_data' );
         */
        this.formManga.set( 'data[items_per_page]', 250 );
        //this.formManga.set( 'data[tag]', 'vc_masonry_grid' );
    }

    /**
     *
     */
    _extractRequestVC( path ) {
        let request = new Request( this.url + path );
        return this.fetchDOM( request, 'div[data-vc-request]' )
            .then( data => {
                let vc = data[0].dataset;
                let shortcode = document.createElement('div');
                shortcode.innerHTML = vc.vcGridSettings;
                shortcode = JSON.parse( shortcode.innerText ).shortcode_id;
                //this.formManga.set( 'vc_post_id', vc.vcPostId );
                this.formManga.set( 'data[page_id]', vc.vcPostId );
                this.formManga.set( 'data[shortcode_id]', shortcode );
                this.formManga.set( '_vcnonce', vc.vcPublicNonce );
                this.requestOptions.method = 'POST';
                this.requestOptions.body = this.formManga.toString();
                let request = new Request( vc.vcRequest, this.requestOptions );
                request.headers.set( 'content-type', 'application/x-www-form-urlencoded' );
                this.requestOptions.method = 'GET';
                delete this.requestOptions.body;
                return Promise.resolve( request );
            } );
    }

    /**
     *
     */
    _getMangaListFromPages( mangaPageLinks, index ) {
        index = index || 0;
        return this._extractRequestVC( mangaPageLinks[ index ] )
            .then( data => this.fetchDOM( data, this.queryMangas, 5 ) )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, this.url ),
                        title: element.title.trim()
                    };
                } );
                if( index < mangaPageLinks.length - 1 ) {
                    return this._getMangaListFromPages( mangaPageLinks, index + 1 )
                        .then( mangas => mangaList.concat( mangas ) );
                } else {
                    return Promise.resolve( mangaList );
                }
            } );
    }

    /**
     *
     */
    _getMangaList( callback ) {
        this._getMangaListFromPages( this.paths )
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
        let uri = new URL( manga.id, this.url );
        let request = new Request(uri.href, this.requestOptions );
        this.fetchDOM( request, this.queryChapters )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element.dataset.ref, request.url ),
                        title: element.textContent.replace( manga.title, '' ).trim(),
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
        let script = `
            new Promise( resolve => {
                resolve( obj.images.map( img => obj.image_url + obj.title + '_' + img.manga_id + '/ch_' + obj.actual + '/' + img.image_name ) );
            } );
        `;
        let uri = new URL( chapter.id, this.url );
        let request = new Request( uri.href, this.requestOptions );
        Engine.Request.fetchUI( request, script )
            .then( data => {
                callback( null, data );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}