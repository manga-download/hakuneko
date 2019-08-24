import SpeedBinb from './SpeedBinb.mjs';

export default class TakeShobo extends SpeedBinb {

    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.tags = [];
        this.url = undefined;
    }

    /**
     *
     */
    _getMangaList( callback ) {
        let uri = this.url + '/';
        this.fetchDOM( uri, 'section.lineup ul li a' )
            .then( data => {
                let mangaList = data.map( element => {
                    let title = element.querySelector( 'source' ).getAttribute( 'alt' );
                    let match = title.match( /『(.*)』/ );
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, uri ),
                        title: ( match ? match[1] : title ).trim()
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
        this.fetchDOM( uri, 'section.episode div.box_episode div.box_episode_text' )
            .then( data => {
                let chapterList = data.map( element => {
                    let anchor = element.querySelector( 'a' );
                    let title = element.querySelector( 'div.episode_title' );
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( anchor, uri ),
                        title: title.innerText.replace( manga.title, '' ).trim(),
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