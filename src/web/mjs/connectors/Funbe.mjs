import Connector from '../engine/Connector.mjs';

export default class Funbe extends Connector {

    constructor() {
        super();
        super.id = 'funbe';
        super.label = 'Funbe';
        this.tags = [ 'manga', 'korean', 'hentai' ];
        this.url = 'https://funbe.care';
        this.language = 'ko';
    }

    async _getMangas() {
        let request = new Request(new URL('/망가', this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.list-container div.section-item-title a');
        return data.map(link => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(link.href, this.url).replace('hakuneko://cache/', '/'),
                title: link.alt.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'table.web_list td.content__title');
        return data.map(link => {
            return {
                id: link.dataset.role,
                title: link.alt.trim()
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let script = `new Promise(resolve => {
            let pages = [...document.querySelectorAll('div#toon_img img')].map(image => {
                return image.src;
            });
            resolve(pages);
        });`;

        return Engine.Request.fetchUI(request, script );
    }
}