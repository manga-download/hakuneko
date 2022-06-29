import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ThreeHentai extends Connector {

    constructor() {
        super();
        super.id = '3hentai';
        super.label = '3Hentai';
        this.tags = [ 'hentai', 'multi-lingual' ];
        this.url = 'https://3hentai.net';
        this.links = {
            login: 'https://3hentai.net/login/'
        };
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div#main-info h1');
        let id = uri.pathname + uri.search;
        let title = data[0].innerText.trim();
        return new Manga( this, id, title);
    }

    async _getMangas() {
        let msg = 'This website does not provide a manga list, please copy and paste the URL containing the images directly from your browser into HakuNeko.';
        throw new Error(msg);
    }

    async _getChapters(manga) {
        return [ { ...manga, language: '' } ];
    }

    async _getPages(chapter) {
        let request = new Request( this.url + chapter.id, this.requestOptions );
        const data = await this.fetchDOM(request, 'div#thumbnail-gallery div.single-thumb-col div.single-thumb a source.lazy');
        return data.map(element => element.dataset.src.replace('t.', 'i.'));
    }
}