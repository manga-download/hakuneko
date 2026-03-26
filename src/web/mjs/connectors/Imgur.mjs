import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Imgur extends Connector {

    constructor() {
        super();
        super.id = 'imgur';
        super.label = 'Imgur';
        this.tags = [ 'hosting' ];
        this.url = 'https://imgur.com';
        this.apiURL = 'https://api.imgur.com/3';
        this.requestOptions.headers.set('Authorization', 'Client-ID 546c25a59c58ad7');
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.post-header h1.post-title');
        let id = uri.pathname.match(/gallery\/(\w+)/)[1];
        let title = data[0].textContent.trim();
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
        let request = new Request(`${this.apiURL}/album/${chapter.id}/images`, this.requestOptions);
        let data = await this.fetchJSON(request);
        return data.data.map(image => this.getAbsolutePath(image.link, this.url));
    }
}