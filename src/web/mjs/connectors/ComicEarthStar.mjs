import Publus from './templates/Publus.mjs';
import Manga from '../engine/Manga.mjs';

export default class ComicEarthStar extends Publus {

    constructor() {
        super();
        super.id = 'comicearthstar';
        super.label = 'コミック　アース・スター (Comic Earth Star)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://www.comic-earthstar.jp';
    }

    async _getMangaFromURI(uri) {
        let id = uri.pathname.match(/\/([^/]+)\/?$/)[1];
        let request = new Request(this.url + '/json/contents/detail/' + id + '.json', this.requestOptions);
        let data = await this.fetchJSON(request);
        let title = data.categorys.comic_category_title;
        return new Manga(this, id, title);
    }

    /**
     *
     */
    _getMangaList( callback ) {
        let request = new Request( this.url + '/json/contents/top/default.json', this.requestOptions );
        this.fetchJSON( request )
            .then( data => {
                let ongoingList = data.serial_comics.map( comic => {
                    return {
                        id: comic.comic_category_code,
                        title: comic.title
                    };
                } );
                let completedList = data.comple_comics.map( comic => {
                    return {
                        id: comic.comic_category_code,
                        title: comic.comic_category_code.toUpperCase()
                    };
                } );
                let mangaList = ongoingList.concat( completedList );
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
        let request = new Request( this.url + '/json/contents/detail/' + manga.id + '.json', this.requestOptions );
        this.fetchJSON( request )
            .then( data => {
                let chapterList = data.episodes.map( episode => {
                    return {
                        id: new URL( episode.page_url, request.url ).href, // episode.cid,
                        title: episode.comic_episode_title,
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