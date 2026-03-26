import SpeedBinb from './templates/SpeedBinb.mjs';
import Manga from '../engine/Manga.mjs';

export default class DigitalMargaret extends SpeedBinb {

    constructor() {
        super();
        super.id = 'digitalmargaret';
        super.label = 'デジタルマーガレット (Digital Margaret)';
        this.tags = ['manga', 'japanese'];
        this.url = 'https://digitalmargaret.jp';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const [data] = await this.fetchDOM(request, 'section#product div.content h3');
        const title = data.textContent.trim();
        const id = uri.pathname;
        return new Manga(this, id, title);
    }

    async _getMangas() {
        const request = new Request(new URL('/', this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'section#serial ul.serial-list li a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('source').getAttribute('alt')
            };
        });
    }

    async _getChapters(manga) {
        const request = new Request(new URL(manga.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'section#product div.list div.box div.number');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.querySelector('a'), this.url) + '/',
                title: element.querySelector('p').textContent.trim(),
            };
        });
    }
}
