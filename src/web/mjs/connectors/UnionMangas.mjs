import Connector from '../engine/Connector.mjs';

export default class UnionMangas extends Connector {

    constructor() {
        super();
        super.id = 'unionmangas';
        super.label = 'UnionMangas';
        this.tags = [ 'manga', 'portuguese' ];
        this.url = 'https://unionmangas.top'; // https://unionleitor.top
        this.links = {
            login: 'https://unionmangas.top/login'
        };
    }

    _getMangaListFromPages( mangaPageLinks, index ) {
        if( index === undefined ) {
            index = 0;
        }
        return this.wait( 0 )
            .then ( () => this.fetchDOM( mangaPageLinks[ index ], 'div.bloco-manga a:nth-of-type(2)', 5 ) )
            .then( data => {
                let mangaList = data.map( element => {
                    this.cfMailDecrypt( element );
                    return {
                        id: this.getRelativeLink( element ),
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
        this.fetchDOM( this.url + '/mangas/visualizacoes', 'nav ul.pagination li:last-of-type a' )
            .then( data => {
                let pageCount = parseInt( data[0].href.match(/(\d+)$/)[1] );
                let pageLinks = [... new Array( pageCount ).keys()].map( page => this.url + '/mangas/visualizacoes/' + ( page + 1 ) );
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

    _getChapterList( manga, callback ) {
        let uri = new URL(manga.id, this.url);
        let request = new Request(uri, this.requestOptions);
        this.fetchDOM(request, 'div.row.lancamento-linha div:first-of-type a:first-of-type' )
            .then( data => {
                let chapterList = data.map( element => {
                    this.cfMailDecrypt( element );
                    return {
                        id: this.getRelativeLink( element ),
                        title: element.text.trim(),
                        language: 'pt'
                    };
                } );
                callback( null, chapterList );
            } )
            .catch( error => {
                console.error( error, manga );
                callback( error, undefined );
            } );
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'source.img-manga');
        return data.map(element => this.getAbsolutePath(element, request.url)).filter(link => !link.includes('banner'));
    }
}