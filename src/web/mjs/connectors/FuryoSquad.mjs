import Connector from '../engine/Connector.mjs';

export default class FuryoSquad extends Connector {

    constructor() {
        super();
        super.id = 'furyosquad';
        super.label = 'Furyo Squad';
        this.tags = [ 'manga', 'french', 'high-quality' ];
        this.url = 'http://www.furyosquad.com/';
    }

    async _getMangas() {
        const categories = ['/', '/en-cours', '/termines', '/stoppes'];

        let request,data;
        let mangas = [];
        for ( const category of categories) {
            request = new Request(new URL(category, this.url), this.requestOptions);
            data = await this.fetchDOM(request, 'div.fs-chap-container div.grid-item-container div.media-body a');
            mangas.push( ...data.map(manga => {
                return {
                    id: this.getRootRelativeOrAbsoluteLink(manga, this.url),
                    title: manga.title.trim()
                };
            }));
        }

        return mangas;
    }

    async _getChapters(manga) {
        const request = new Request(new URL(manga.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'div.list.fs-chapter-list div.title a');

        return data.map(chapter => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(chapter, this.url),
                title: chapter.title.trim()
            };
        });
    }

    async _getPages(chapter) {
        const request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'div.fs-reader-page source');

        return data.map(page => page.src);
    }
}