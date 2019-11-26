import Connector from '../engine/Connector.mjs';

export default class Neonime extends Connector {
    constructor() {
        super();
        super.id = 'neonime';
        super.label = 'Neonime';
        this.tags = ['anime', 'indonesian'];
        this.url = 'https://neonime.org/';
    }

    async _getMangas() {
        let request = new Request(this.url + '/list-anime/', this.requestOptions);
        let data = await this.fetchDOM(request, 'div#inner-slider div[id^=letter-] a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(this.url + manga.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'ul.episodios li div.episodiotitle a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(this.url + chapter.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'div#player21 p iframe source');
        return data.map(element => this.getAbsolutePath(element, request.url));
    }
}