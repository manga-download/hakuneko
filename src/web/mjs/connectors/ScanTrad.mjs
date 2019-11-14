import Connector from '../engine/Connector.mjs';

export default class ScanTrad extends Connector {

    constructor() {
        super();
        super.id = 'scantrad';
        super.label = 'ScanTrad';
        this.tags = [ 'manga', 'french', 'high-quality', 'scanlation' ];
        this.url = 'https://scantrad.net';
    }

    async _getMangas() {
        let request = new Request(this.url + '/mangas', this.requestOptions);
        let data = await this.fetchDOM(request, 'div.main div.home a.home-manga');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.querySelector('div.hmi-titre').textContent.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(this.url + manga.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.chapitre');
        return data.filter(element => element.querySelector('span.chl-num'))
            .map(element => {
                let number = element.querySelector('div.chl-titre span.chl-num').textContent.trim();
                let title = element.querySelector('div.chl-titre span.chl-titre').textContent.trim();
                let link = element.querySelector('div.ch-right a');
                return {
                    id: this.getRootRelativeOrAbsoluteLink(link, request.url),
                    title: number + ' - ' + title,
                    language: ''
                };
            });
    }

    async _getPages(chapter) {
        let request = new Request(this.url + chapter.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.main_img div.sc-lel source');
        return data.map(element => this.getAbsolutePath(element.dataset.src || element, this.url))
            .filter(link => !link.includes('8b9fe6b2827ee50f3d43c54d6489fe31e71bd268'));
    }
}