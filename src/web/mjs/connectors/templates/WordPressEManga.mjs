import Connector from '../../engine/Connector.mjs';

export default class WordPressEManga extends Connector {

    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.tags = [];
        this.url = undefined;
        this.path = '/list/';

        this.queryMangas = 'div#content div.soralist ul li a.series';
        this.queryChapters = 'div.cl ul li span.leftoff a';
        this.queryPages = 'div#readerarea source[src]:not([src=""])';
    }

    /**
     *
     */
    _getMangaList( callback ) {
        this.fetchDOM( this.url + this.path, this.queryMangas )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRelativeLink( element ),
                        title: element.text.trim()
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
        return this.fetchDOM( this.url + manga.id, this.queryChapters )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: this.getRelativeLink( element ),
                        title: element.text.replace( manga.title, '' ).trim(),
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

    async _getPageList(manga, chapter, callback) {
        try {
            let request = new Request(this.url + chapter.id, this.requestOptions);
            let data = await this.fetchDOM(request, this.queryPages);
            let pageLinks = data.map(element => this.getAbsolutePath(element.dataset['lazySrc'] || element, request.url));
            pageLinks = pageLinks.filter(link => !link.includes('histats.com'));
            callback(null, pageLinks);
        } catch(error) {
            console.error(error, chapter);
            callback(error, undefined);
        }
    }
}