import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class DaumWebtoon extends Connector {

    constructor() {
        super();
        super.id = 'daumwebtoon';
        super.label = 'Daum 웹툰';
        this.tags = [ 'webtoon', 'korean' ];
        this.url = 'http://webtoon.daum.net';
        this.apiURL = 'http://webtoon.daum.net/data/pc/webtoon';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(this.apiURL + uri.pathname + uri.search, this.requestOptions);
        let data = this.fetchJSON(request);
        let id = data.data.webtoon.nickname;
        let title = data.data.webtoon.title;
        return new Manga(this, id, title);
    }

    /**
     *
     */
    _getMangaListFromPages( mangaPageLinks, index ) {
        index = index || 0;
        let request = new Request( mangaPageLinks[ index ], this.requestOptions );
        return this.fetchJSON( request )
            .then( data => {
                let mangaList = data.data.map( manga => {
                    return {
                        id: manga.nickname,
                        title: manga.title
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
        Promise.resolve( [
            '/list_serialized/mon',
            '/list_serialized/tue',
            '/list_serialized/wed',
            '/list_serialized/thu',
            '/list_serialized/fri',
            '/list_serialized/sat',
            '/list_serialized/sun',
            '/list_finished',
            '/list_gidamoo'
        ] )
            .then( data => {
                let pageLinks = data.map( path => this.apiURL + path );
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
        let request = new Request( this.apiURL + '/view/' + manga.id, this.requestOptions );
        this.fetchJSON( request )
            .then( data => {
                let chapterList = data.data.webtoon.webtoonEpisodes
                    .filter( episode => episode.isPaid || episode.serviceType === 'free' )
                    .map( episode => {
                        return {
                            id: episode.id,
                            title: episode.title.trim(),
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
        let request = new Request( this.apiURL + '/viewer_images/' + chapter.id, this.requestOptions );
        this.fetchJSON( request )
            .then( data => {
                let pageList = data.data.map( image => this.getAbsolutePath( image.url, request.url ) );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}