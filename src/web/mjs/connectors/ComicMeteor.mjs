import SpeedBinb from './templates/SpeedBinb.mjs';

/**
 *
 */
export default class ComicMeteor extends SpeedBinb {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'comicmeteor';
        super.label = 'COMICメテオ (COMIC Meteor)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://comic-meteor.jp';
    }

    /**
     *
     */
    _getMangaListFromPages( page ) {
        page = page || 1;
        let request = new Request( this.url + '/wp-admin/admin-ajax.php?action=get_flex_titles_for_toppage&get_num=64&page=' + page, this.requestOptions );
        return this.fetchDOM( request, 'div.update_work_size div.update_work_info_img a', 5 )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
                        title: element.querySelector( 'source' ).getAttribute('alt').trim()
                    };
                } );
                if( mangaList.length > 0 ) {
                    return this._getMangaListFromPages( page + 1 )
                        .then( mangas => mangaList.concat( mangas ) );
                } else {
                    return Promise.resolve( mangaList );
                }
            } );
    }

    /**
     *
     */
    _getMangaList( callback ) {
        this._getMangaListFromPages()
            .then( data => {
                callback( null, data );
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
        let request = new Request( this.url + manga.id, this.requestOptions );
        this.fetchDOM( request, 'div#contents' )
            .then( data => {
                data = data[0];
                let chapterList = [...data.querySelectorAll( 'div.work_episode div.work_episode_box div.work_episode_table div.work_episode_link_btn a' )]
                    .map( element => {
                        return {
                            id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
                            title: element.closest( 'div.work_episode_table' ).querySelector( 'div.work_episode_txt' ).innerText.replace( manga.title, '' ).trim(),
                            language: ''
                        };
                    } );
                if( chapterList.length === 0 ) {
                    chapterList = [...data.querySelectorAll( 'div.latest_info_box div.latest_info_link_btn01 a' )]
                        .map( element => {
                            return {
                                id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
                                title: element.text.replace( '読む', '' ).trim(),
                                language: ''
                            };
                        } );
                }
                callback( null, chapterList );
            } )
            .catch( error => {
                console.error( error, manga );
                callback( error, undefined );
            } );
    }
}