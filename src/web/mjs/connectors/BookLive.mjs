import SpeedBinb from './templates/SpeedBinb.mjs';
import Manga from '../engine/Manga.mjs';

export default class BookLive extends SpeedBinb {

    constructor() {
        super();
        super.id = 'booklive';
        super.label = 'BookLive';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://booklive.jp';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div#product_detail_area div.product_info > h1#product_display_1', 3);
        let id = uri.pathname;
        let title = data[0].innerText.trim();
        return new Manga(this, id, title);
    }

    /**
     *
     */
    _getMangaList( callback ) {
        // https://booklive.jp/select/title/page_no/5012
        let msg = 'This website does not support mangas/chapters, please copy and paste the links containing the chapters directly from your browser into HakuNeko.';
        callback( new Error( msg ), undefined );
    }

    /**
     *
     */
    _getChapterList( manga, callback ) {
        let request = new Request( this.url + manga.id, this.requestOptions );
        this.fetchDOM( request, 'div#product_detail_area div.product_actions ul[class*="_actions"] a.bl-bviewer' )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: '/bviewer/s/?cid=' + element.dataset.title + '_' + element.dataset.vol,
                        title: element.dataset.vol.trim(),
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
}