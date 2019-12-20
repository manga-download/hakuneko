import Connector from '../engine/Connetors.mjs';
import Manga from '../engine/Manga.mjs';
/*
 * import PrettyFast from '../videostreams/PrettyFast.mjs';
 * import HydraX from '../videostreams/HidraX.mjs';
 */

export default class AnimeYT extends Connector {
    constructor() {
        super();
        super.id = 'animeyt';
        super.label = 'AnimeYT';
        this.tags = ['anime', 'spanish'];
        this.url = 'https://animeyt2.tv';
        this.requestOptions.headers.set('x-requested-with', 'XMLHttpRequest');
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let response = await fetch(request);
        let data = await response.text();
        let dom = this.createDom(data);
        let metaURL = dom.querySelector('meta[property="og:url"]').content.trim();
        let metaTitle = dom.querySelector('h3.capitulos-grid__item__title');
        let id = this.getRootRelativeOrAbsoluteLink(metaURL, request.url);
        let title = metaTitle.dataset.jtitle.trim();
        return new Manga(this, id ,title);
    }

    _getMangaListFromPages( mangaPageLinks, index ) {
        index = index || 0;
        let request = new Request( mangaPageLinks[ index ], this.requestOptions );
        return this._checkCaptcha(request)
            .then(() => this.fetchDOM( request, 'a.capitulos-grid__item__link.fakeplayer.capitulo_poster', 5 ))
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
                        title: element.text.trim()
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

    _getMangaList( callback ) {
        let request = new Request( this.url + '/animes?page=', this.requestOptions );
        this._checkCaptcha(request)
            .then(() => this.fetchDOM( request, '.animes-grid .anime .anime--flip .anime--flip__front a' ))
            .then( data => {
                let pageCount = parseInt( data[0].textContent.trim() );
                let pageLinks = [... new Array( pageCount ).keys()].map( page => request.url + ( page + 1 ) );
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
}