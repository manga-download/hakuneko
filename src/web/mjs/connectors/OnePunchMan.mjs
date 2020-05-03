import Connector from '../engine/Connector.mjs';

export default class OnePunchMan extends Connector {

    constructor() {
        super();
        super.id = 'onepunchman';
        super.label = 'One-Punch Man';
        this.tags = [ 'manga', 'english', 'high-quality' ];
        this.url = 'https://www.one-punchman.com';
    }

    async _getMangas() {
        return [
            {
                id: this.url,
                title: this.label
            }
        ];
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id), this.requestOptions);
        let data = await this.fetchDOM(request, '#Chapters_List a');

        return data.map(element => {
            return {
                id: this.getAbsolutePath(element, this.url),
                title: element.text.split(', ')[1],
                language: 'en'
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id), this.requestOptions);
        let data = await this.fetchDOM(request, '.entry-content a');

        return data.map(element => this.getAbsolutePath(element, request.url));
    }
}