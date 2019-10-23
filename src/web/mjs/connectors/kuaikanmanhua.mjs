import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Kauikanmanhua extends Connector {

    constructor() {
        super();
        super.id = 'kuaikanmanhua';
        super.label = 'Kuaikanmanhua';
        this.tags = ['manga', 'japanese'];
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
        try {
            let request = new Request(this.url + manga.id, this.requestOptions);
            let data = await this.fetchDOM(request, 'div.TopicList div div.TopicItem div.title a');
            let chapterList = data.map(element => {
                return {
                    id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                    title: element.text.trim(),
                    language: ''
                };
            }).filter(chapter => chapter.id !== 'javascript:void(0);');
            callback(null, chapterList);
        } catch (error) {
            console.error(error, manga);
            callback(error, undefined);
        }
    }

    async _getPageList(manga, chapter, callback) {
        try {
            let script = `
            new Promise(resolve => {
                let pages = __NUXT__.data[0].comicInfo.comicImages.map(img => img.url);
                resolve(pages);
            });`;
            let request = new Request(this.url + chapter.id, this.requestOptions);
            let pageList = await Engine.Request.fetchUI(request, script);
            callback(null, pageList);
        } catch (error) {
            console.error(error, manga);
            callback(error, undefined);
        }
    }
}