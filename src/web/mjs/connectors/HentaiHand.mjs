import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class HentaiHand extends Connector {

    constructor() {
        super();
        super.id = 'hentaihand';
        super.label = 'HentaiHand';
        this.tags = [ 'hentai', 'multi-lingual' ];
        this.url = 'https://hentaihand.com';
        this.requestOptions.headers.set('x-referer', this.url);
    }

    async _getMangaFromURI(uri) {
        const slug = uri.href.split('/').pop();
        const apiUrl = new URL('/api/comics/' + slug, this.url);
        const data = await this.fetchJSON( new Request(apiUrl));
        return new Manga(this, data.slug, data.title.trim());
    }

    async _getMangas() {
        throw new Error('This website does not provide a manga list, please copy and paste the URL containing the images directly from your browser into HakuNeko.');
    }

    async _getChapters(manga) {
        return[ Object.assign({ language: '' }, manga) ];
    }

    async _getPages(chapter) {
        const apiUrl = new URL(`/api/comics/${chapter.id}/images`, this.url);
        const data = await this.fetchJSON( new Request(apiUrl));
        return data.images.map(page => this.createConnectorURI(page.source_url));
    }
}
