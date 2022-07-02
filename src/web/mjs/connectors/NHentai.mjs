import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class NHentai extends Connector {

    constructor() {
        super();
        super.id = 'nhentai';
        super.label = 'NHentai';
        this.tags = [ 'hentai' ];
        this.url = 'https://nhentai.net';
        this.links = {
            login: 'https://nhentai.net/login/'
        };
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div#info-block div#info h1');
        let id = uri.pathname + uri.search;
        let title = data[0].innerText.trim();
        return new Manga( this, id, title);
    }

    async _getMangas() {
        let msg = 'This website does not provide a manga list, please copy and paste the URL containing the images directly from your browser into HakuNeko.';
        throw new Error(msg);
    }

    async _getChapters(manga) {
        return [ Object.assign({ language: '' }, manga) ];
    }

    async _getPages(chapter) {
        let request = new Request( this.url + chapter.id, this.requestOptions );
        const data = await this.fetchDOM(request, 'div#thumbnail-container a.gallerythumb source.lazyload');
        return data.map(element => element.dataset.src.replace('t.', 'i.').replace(/\/t/g, '/i'));
    }
}