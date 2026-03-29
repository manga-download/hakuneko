import Connector from '../../engine/Connector.mjs';
import Manga from '../../engine/Manga.mjs';

export default class Ciayo extends Connector {

    constructor() {
        super();
        super.id = 'ciayo';
        super.label = 'CIAYO';
        this.tags = [];
        this.url = '';
        this.baseURL = 'https://vueserion.ciayo.com/3.2';

        this.language = '';
    }

    /**
     *
     */
    _requestJSON( url ) {
        let request = new Request( url, this.requestOptions );
        return fetch( request )
            .then( response => response.json() )
            .then( data => {
                if( data.c.status.error ) {
                    throw new Error( data.c.status.message );
                }
                return Promise.resolve( data.c.data );
            } );
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'h1.comicCover-title');
        let id = uri.pathname.split('/').pop();
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    /**
     *
     */
    _getMangaListFromPages( mangaPageLinks, index ) {
        index = index || 0;
        return this._requestJSON( mangaPageLinks[ index ] )
            .then( data => {
                let mangaList = data.map( item => {
                    return {
                        id: item.alias, // item.code, item.share_url
                        title: item.title
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
        this._requestJSON( `${this.baseURL}/challenges/volumes?app=desktop&language=${this.language}` )
            .then( data => {
                let pageLinks = data.map( volume => `${this.baseURL}/challenges/volumes/${volume.alias}?count=9999&app=desktop&language=${this.language}` );
                pageLinks.push( `${this.baseURL}/comics?app=desktop&count=9999&language=${this.language}` );
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
        this._requestJSON( `${this.baseURL}/comics/${manga.id}/chapters?app=desktop&language=${this.language}&count=9999` )
            .then( data => {
                let chapterList = data.sort( ( a, b ) => b.order - a.order ).map( item => {
                    return {
                        id: item.alias, // item.share_url
                        title: item.episode,
                        language: this.language
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
        this._requestJSON( `${this.baseURL}/comics/${manga.id}/chapters/${chapter.id}?app=desktop&language=${this.language}&with=slices` )
            .then( data => {
                let pageList = data.slices.sort( ( a, b ) => a.order - b.order ).map( item => item.image );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}