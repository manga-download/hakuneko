import Connector from '../engine/Connector.mjs';

export default class ScanTrad extends Connector {

    constructor() {
        super();
        super.id = 'scantrad';
        super.label = 'ScanTrad';
        this.tags = [ 'manga', 'french', 'high-quality', 'scanlation' ];
        this.url = 'https://scantrad.net';
        this.links = {
            login: 'https://scantrad.net/connexion'
        };
    }

    async _getMangas() {
        let request = new Request(this.url + '/mangas', this.requestOptions);
        let data = await this.fetchDOM(request, 'div.main div.home div.manga div.manga_right div.mr-info a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(this.url + manga.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.chapitre a.ch-left');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.querySelector('div.chl-titre span.chl-num').textContent.trim()
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(this.url + chapter.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.main_img div.sc-lel > source');
        return data.map(element => this.getAbsolutePath(element.dataset.src || element, 'https://scan-trad.fr')).filter(link => !link.includes('/images/'));
    }
}