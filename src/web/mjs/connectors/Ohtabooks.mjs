import SpeedBinb from './templates/SpeedBinb.mjs';

/**
 *
 */
export default class Ohtabooks extends SpeedBinb {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'ohtabooks';
        super.label = 'Ohtabooks';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'http://webcomic.ohtabooks.com';
    }

    /**
     *
     */
    _getMangaList( callback ) {
        let uri = this.url + '/list/';
        this.fetchDOM( uri, 'div.bnrList ul li a' )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, uri ),
                        title: element.querySelector( '.title' ).textContent.trim()
                    };
                } );
                callback( null, mangaList );
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
        let uri = this.url + manga.id;
        this.fetchDOM( uri, 'a[onClick^="return !openBook("]' )
            .then( data => {
                let chapterList = data.map( element => {
                    let partId = element.getAttribute( 'onclick' );
                    partId = partId.match(/\d+/);

                    let title = element.querySelector( '.title' );
                    if( title )
                    {
                        title = title.textContent;
                    }
                    else if( element.classList.contains( 'btnMini' ) )
                    {
                        title = element.textContent;
                    }

                    return {
                        id: this.getRootRelativeOrAbsoluteLink( 'https://yondemill.jp/contents/' + partId + '?view=1&u0=1', uri ),
                        title: title ? title.trim() : 'マンガをよむ',
                        language: 'ja'
                    };
                } );

                // Remove duplicates
                chapterList = chapterList.reverse().filter( ( chapter, index ) => {
                    return index === chapterList.findIndex( c => c.id === chapter.id );
                } );

                callback( null, chapterList );
            } )
            .catch( error => {
                console.error( error, manga );
                callback( error, undefined );
            } );
    }

    _getPageList( manga, chapter, callback ) {
        this.fetchDOM( chapter.id, 'script[type="text/javascript"]' )
            .then( data => {
                data = data[0].innerHTML;
                let ch = {
                    id: data.substring( data.indexOf('\'') + 1, data.lastIndexOf('\'') ),
                    title: chapter.title,
                    language: chapter.language
                };
                super._getPageList( manga, ch, callback );
            } );
    }
}