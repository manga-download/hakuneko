import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Buka extends Connector {

    constructor() {
        super();
        super.id = 'buka';
        super.label = '布卡 (Buka)';
        this.tags = [ 'manga', 'chinese' ];
        this.url = 'http://www.buka.cn';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'section.main div.manga-title div.wrap h1.title-font', 3);
        let id = uri.pathname + uri.search;
        let title = data[0].innerText.trim();
        return new Manga(this, id, title);
    }

    /**
     *
     */
    _getMangaListFromPages( page ) {
        page = page || 0;
        let request = new Request( this.url + '/all/' + page, this.requestOptions );
        return this.fetchDOM( request, 'div#manga-list ul#mangawrap li.manga-item div.manga-names a.manga-name', 5 )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
                        title: element.text.trim()
                    };
                } );
                if( mangaList.length > 0 ) {
                    return this._getMangaListFromPages( page + 28 )
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
        this._getMangaListFromPages()
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
        let request = new Request( this.url + manga.id, this.requestOptions );
        this.fetchDOM( request, 'section.main div.manga-desc div#episodes div.epsbox a.epsbox-eplink' )
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
        this.fetchDOM( request, 'div#manga-imgs div.manga-c source' )
            .then( data => {
                let pageList = data.map( element => this.getAbsolutePath( element.dataset['original'] || element, request.url ) );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}