import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Kuaikanmanhua extends Connector {

    constructor() {
        super();
        super.id = 'kuaikanmanhua';
        super.label = 'Kuaikanmanhua';
        this.tags = ['manga', 'chinese'];
        this.url = 'https://www.kuaikanmanhua.com';
        this.list = '/tag/0';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'head title');
        let id = uri.pathname;
        let title = data[0].text.split('|')[0].trim();
        return new Manga(this, id, title);
    }

    _getMangaListFromPages( mangaPageLinks, index ) {
        if( index === undefined ) {
            index = 0;
        }
        return this.wait( 0 )
            .then ( () => this.fetchDOM( mangaPageLinks[ index ], 'div.tagContent div a', 5 ) )
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
        this.fetchDOM( this.url + this.list, 'ul.pagination li:nth-last-child(2) a' )
            .then( data => {
                let pageCount = parseInt( data[0].text.match( /\d+/ )[0] );
                let pageLinks = [... new Array( pageCount ).keys()].map( page => this.url + this.list + '?page=' + ( page + 1 ) );
                return this._getMangaListFromPages( pageLinks );
            })
            .then( data => {
                callback( null, data );
            })
            .catch( error => {
                console.error( error, this );
                callback( error, undefined );
            });
    }

    async _getChapterList(manga, callback) {
        let chapterList = await this.resolveChapterList(manga, 'comics');
        if (chapterList.length < 1) {
            chapterList = await this.resolveChapterList(manga, 'comicList');
        }
        if (chapterList.length < 1) {
            console.error('No chapters found !', this);
            callback( error, undefined );
            return;
        }
        callback(null, chapterList);
    }
    
    async resolveChapterList(manga, objname) {
        let chapterList = [];
        try {
            let script = `
            new Promise(resolve => {
                let pages = __NUXT__.data[0].`+objname+`.map( comic => {
                    return {
                        id : '/web/comic/'+comic.id,
                        title: comic.title.trim()
                    };
                }).reverse();
                resolve(pages);
            });
            `;
            let request = new Request(this.url + manga.id, this.requestOptions);
            chapterList = await Engine.Request.fetchUI(request, script);
        }
        catch (error) {
            console.error(error, manga);
        }
        return chapterList;
    }
    
    async _getPageList(manga, chapter, callback) {
        let newRequestOptions = Object.assign({}, this.requestOptions);
        newRequestOptions.headers.set(
            'x-user-agent',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1'
        );

        try {
            let script = `
            new Promise(resolve => {
                let pages = __NUXT__.data[0].comicInfo.comic_images.map(img => img.url);
                resolve(pages);
            });`;
            let request = new Request(this.url + chapter.id, newRequestOptions);
            let pageList = await Engine.Request.fetchUI(request, script);
            callback(null, pageList);
        } catch (error) {
            console.error(error, manga);
            callback(error, undefined);
        }
    }
}
