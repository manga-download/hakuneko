import Connector from '../../engine/Connector.mjs';
import Manga from '../../engine/Manga.mjs';

export default class PizzaReader extends Connector {

    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.tags = [];
        this.url = undefined;
    }

    async _getMangaFromURI(uri) {
        const slug = uri.pathname.match(/([^/]*)\/*$/)[1];
        const url = new URL('/api/comics/' + slug, this.url);
        const request = new Request(url, this.requestOptions);
        const { comic: { title } } = await this.fetchJSON(request);
        return new Manga(this, slug, title);
    }

    async _getMangas() {
        const url = new URL('/api/comics', this.url);
        const request = new Request(url, this.requestOptions);
        const { comics } = await this.fetchJSON(request);
        return comics.map(item => {
            return {
                id: item.slug,
                title: item.title
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL('/api/comics/' + manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const { comic: { chapters } } = await this.fetchJSON(request);
        return chapters.map(chapter => {
            return {
                id: chapter.url,
                title: chapter.full_title,
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL('/api' + chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const { chapter: chap } = await this.fetchJSON(request);
        return chap.pages;
    }
}