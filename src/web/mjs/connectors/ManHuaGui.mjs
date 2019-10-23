import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ManHuaGui extends Connector {

    constructor() {
        super();
        super.id = 'manhuagui';
        super.label = 'ManHuaGui';
        this.tags = [ 'manga', 'chinese' ];
        this.url = 'https://www.manhuagui.com';
        this.requestOptions.headers.set('x-referer', this.url);
        this.requestOptions.headers.set('x-cookie', 'isAdult=1');
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.book-cont div.book-detail div.book-title h1', 3);
        let id = uri.pathname + uri.search;
        let title = data[0].innerText.trim();
        return new Manga(this, id, title);
    }

    /**
     * Parameters mangalist and page should never be used by external calls.
     */
    _getMangaList( callback ) {
        let request = new Request( 'http://cdn.hakuneko.download/' + this.id + '/mangas.json', this.requestOptions );
        this.fetchJSON( request )
            .then( data => {
                callback( null, data );
            } )
            .catch( error => {
                console.error( error, this );
                callback( error, undefined );
            } );
    }

    async _getChapterList( manga, callback ) {
        try {
            let script = `
                new Promise(resolve => {
                    let button = document.querySelector('#checkAdult');
                    if(button) {
                        button.click();
                    }
                    chapterList = [...document.querySelectorAll('div.chapter div.chapter-list ul li a')].map(element => {
                        return {
                            id: new URL(element.href, window.location).pathname,
                            title: element.title.trim(),
                            language: ''
                        };
                    });
                    resolve(chapterList);
                });
            `;
            let request = new Request(this.url + manga.id, this.requestOptions);
            let data = await Engine.Request.fetchUI(request, script);
            callback(null, data);
        } catch(error) {
            console.error( error, manga );
            callback( error, undefined );
        }
    }

    /**
     *
     */
    _getPageList( manga, chapter, callback ) {
        let script = `
                new Promise( ( resolve, reject ) => {
                    setTimeout( () => { reject( new Error( 'Failed to get page links!' ) ) }, 5000 );
                    SMH.imgData = function(data) {
                        let origin = 'https://' + servs[pVars.curServ].hosts[pVars.curHost].h + '.hamreus.com';
                        let pageLinks = data.files.map( file => origin + data.path + file + '?cid=' + data.cid + '&md5=' + data.sl.md5 );
                        return { preInit: () => resolve( pageLinks ) };
                    };
                    let script = [...document.querySelectorAll('script:not([src])')].find(script => script.text.trim().startsWith('window[')).text;
                    eval( script );
                } );
            `;
        let request = new Request( this.url + chapter.id, this.requestOptions );
        Engine.Request.fetchUI( request, script )
            .then( data => {
                let pageList = data.map( page => this.createConnectorURI( page ) );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}