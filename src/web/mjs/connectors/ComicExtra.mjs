import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ComicExtra extends Connector {

    constructor() {
        super();
        super.id = 'comicextra';
        super.label = 'ComicExtra';
        this.tags = ['comic', 'english'];
        this.url = 'http://www.comicextra.com';
    }

    _getMangas() {
        let msg = 'This website provides a manga list that is to large to scrape, please copy and paste the URL containing the images directly from your browser into HakuNeko.';
        throw new Error(msg);
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, '.title-1');
        const id = uri.pathname;
        const title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, '#list tr td a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.textContent.trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        const request = new Request(this.url + chapter.id + '/full', this.requestOptions);
        const data = await this.fetchDOM(request, '.chapter_img');
        return data.map(element => element.src);
    }
}