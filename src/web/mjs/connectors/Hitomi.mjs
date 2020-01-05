import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Hitomi extends Connector {

    constructor() {
        super();
        super.id = 'hitomi';
        super.label = 'Hitomi';
        this.tags = [ 'hentai', 'english' ];
        this.url = 'https://hitomi.la';
        this.requestOptions.headers.set( 'x-referer', this.url );
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.gallery h1 a', 3);
        let id = uri.pathname.match(/(\d+)\.html$/)[1];
        let title = data[0].text.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let msg = 'This website does not provide a manga list, please copy and paste the URL containing the images directly from your browser into HakuNeko.';
        throw new Error(msg);
    }

    async _getChapters(manga) {
        return [ {
            id: manga.id,
            title: manga.title,
            language: ''
        } ];
    }

    async _getPages(chapter) {
        let request = new Request(`${this.url}/reader/${chapter.id}.html`, this.requestOptions);
        let data = await Engine.Request.fetchUI(request, `images`);
        return data.map(image => this.createConnectorURI(this.getAbsolutePath(image.path, request.url)));
    }
}