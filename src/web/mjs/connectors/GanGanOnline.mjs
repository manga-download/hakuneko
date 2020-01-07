import Publus from './templates/Publus.mjs';

export default class GanGanOnline extends Publus {

    constructor() {
        super();
        super.id = 'ganganonline';
        super.label = 'ガンガンONLINE (Gangan Online)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://www.ganganonline.com';

        this.customerScriptPart = `
            if(document.querySelector('script[src*="GanGanOnline_WebViewer"]')) {
                let chapterID = new URL(window.location).searchParams.get('chapterId');
                let response = await fetch('https://web-ggo.tokyo-cdn.com/web_manga_data?chapter_id=' + chapterID, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/octet-stream'
                    }
                });
                let data = await response.arrayBuffer();
                let pageList = parcelRequire.cache.KC6V.exports.Proto.Response.decode(new Uint8Array(data)).success.webMangaViewer.pages;
                pageList = pageList.filter(page => page.image && !page.image.imageUrl.includes('extra_manga_page'));
                pageList = pageList.map(page => Object.assign(page.image/*.linkImage*/, { mode: page.image.encryptionKey ? 'xor' : 'raw' }));
                return resolve(pageList);
            }
        `;
    }

    _getMangaListFromPage( link, queryLink, queryTitle ) {
        return this.fetchDOM( link, queryLink, 5 )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRelativeLink( element ),
                        title: element.querySelector( queryTitle ).textContent.trim()
                    };
                } );
                return Promise.resolve( mangaList );
            } );
    }

    _getMangaList( callback ) {
        let promises = [
            this._getMangaListFromPage( this.url + '/contents/', 'div#comicList ul li a.gn_link_cList', 'span.gn_cList_title' ),
            /*
             *this._getMangaListFromPage( this.url + '/contents/', 'div#gn_cList_novel ul#novelList li a.gn_link_cList', 'span.gn_cList_title' ),
             * archive contains comics + news => need to filter news
             *this._getMangaListFromPage( this.url + '/archive/', 'div#gn_archive_newestList div.gn_archive_margin a.gn_link_archivelist', 'span.gn_top_whatslist_ttl' )
             */
        ];
        Promise.all( promises )
            .then( data => {
                //data.map( list => console.log( list ) );
                let mangaList = data.reduce( ( accumulator, value ) => accumulator.concat( value ), [] );
                callback( null, mangaList );
            } )
            .catch( error => {
                console.error( error, this );
                callback( error, undefined );
            } );
    }

    _getChapterList( manga, callback ) {
        fetch( this.url + manga.id, this.requestOptions )
            .then( response => response.text() )
            .then( data => {
                let dom = this.createDOM( data );
                let chapterLatest = dom.querySelector( 'div.gn_detail_story_list dd ul' );
                chapterLatest = {
                    id: this.getRelativeLink( chapterLatest.querySelector( 'li.gn_detail_story_btn a.gn_link_btn' ) ),
                    title: chapterLatest.querySelector( 'li.gn_detail_story_list_ttl' ).textContent.trim(),
                    language: 'jp'
                };
                let chapterList = [...dom.querySelectorAll( 'div.gn_detail_story_past ul.past_2c li.gn_detail_story_past_2c a.gn_link_list' )]
                    .map( element => {
                        return {
                            id: this.getRelativeLink( element ),
                            title: element.text.trim(),
                            language: 'jp'
                        };
                    } );
                chapterList.push(chapterLatest);
                callback( null, chapterList );
            } )
            .catch( error => {
                console.error( error, manga );
                callback( error, undefined );
            } );
    }
}