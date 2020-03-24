import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class OnePunchMan extends Connector {

    constructor() {
        super();
        super.id = 'onepunchman';
        super.label = 'One-Punch Man';
        this.tags = [ 'manga', 'english', 'high-quality' ];
        this.url = 'https://ww3.one-punchman.com/';
    }

    async _getMangas() {
        return [
            {
                id: 'onepunchman',
                title: this.label
            }
        ];
    }

    async _getChapters() {
        let request = new Request(this.url, this.requestOptions);
        let data = await this.fetchDOM(request, '#Chapters_List a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.split(", ")[1],
                language: 'en'
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(this.url + chapter.id, this.requestOptions);
        let data = await this.fetchDOM(request, '.entry-content a');
        return data.map(element => this.getAbsolutePath(element, request.url));
    }

    async _getMangaFromURI(uri) {
        let id = this.getRootRelativeOrAbsoluteLink(uri.href, this.url);
        let title = this.label;
        return new Manga(this, id, title);
    }
}