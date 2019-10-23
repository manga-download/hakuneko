import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ManhuaTai extends Connector {

    constructor() {
        super();
        super.id = 'manhuatai';
        super.label = 'ManhuaTai';
        this.tags = [ 'webtoon', 'chinese' ];
        this.url = 'https://www.manhuatai.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.mainctx div.mhjsbody ul li:first-of-type', 3);
        let id = uri.pathname + uri.search;
        let title = data[0].innerText.replace('名称：', '').trim();
        return new Manga(this, id, title);
    }

    /**
     *
     */
    _getMangaList( callback ) {
        let msg = 'This website does not provide a manga list, please copy and paste the URL containing the chapters directly from your browser into HakuNeko.';
        callback( new Error( msg ), undefined );
    }

    /**
     *
     */
    _getChapterList( manga, callback ) {
        let request = new Request( this.url + manga.id, this.requestOptions );
        this.fetchDOM( request, 'div.mainctx div#alllist div.mhlistbody ul li a' )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
                        title: element.text.replace( manga.title, '' ).replace( /\(\d+P\)/i, '' ).trim(),
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
                new Promise( ( resolve, reject ) => {
                    let pages = [...( new Array( mh_info.totalimg ) ).keys()].map( page => __cr.getPicUrl( page + mh_info.startimg ) );
                    resolve( pages );
                } );
            `;
        let request = new Request( this.url + chapter.id, this.requestOptions );
        Engine.Request.fetchUI( request, script )
            .then( data => {
                let pageList = data.map( element => this.getAbsolutePath( element, request.url ) );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}