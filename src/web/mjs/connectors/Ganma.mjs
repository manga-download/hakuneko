import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Ganma extends Connector {

    constructor() {
        super();
        super.id = 'ganma';
        super.label = 'GANMA!';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://ganma.jp';
        this.requestOptions.headers.set( 'x-from', this.url );
    }

    async _getMangaFromURI(uri) {
        let request = new Request(this.url + '/api/2.0/magazines/' + uri.pathname.split('/').pop(), this.requestOptions);
        let data = await this.fetchJSON(request);
        let id = data.root.id; // panel.alias, panel.link
        let title = data.root.title.trim();
        return new Manga(this, id, title);
    }

    _getMangaList( callback ) {
        let request = new Request( this.url + '/api/2.2/top', this.requestOptions );
        this.fetchJSON( request )
            .then( data => {
                let mangaList = data.root.boxes.reduce( ( accumulator, box ) => {
                    let mangas = box.panels.map( panel => {
                        return {
                            id: panel.id, // panel.alias, panel.link
                            title: panel.title.trim()
                        };
                    } );
                    return accumulator.concat( mangas );
                }, [] );
                callback( null, mangaList );
            } )
            .catch( error => {
                console.error( error, this );
                callback( error, undefined );
            } );
    }

    async _getChapters(manga) {
        const uri = new URL('/api/1.0/magazines/web/' + manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.root.items
            .filter(chapter => chapter.kind === 'free')
            .map((chapter, index) => {
                return {
                    id: chapter.id,
                    title: ((chapter.number || index + 1) + ': 【' + chapter.title + '】 ' + chapter.subtitle).trim()
                };
            });
    }

    async _getPages(chapter) {
        const uri = new URL('/api/1.0/magazines/web/' + chapter.manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        let data = await this.fetchJSON(request);
        data = data.root.items.find(item => item.id === chapter.id ).page;
        return data.files.map(image => this.getAbsolutePath(image + '?' + data.token, data.baseUrl));
    }
}