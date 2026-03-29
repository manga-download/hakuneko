import MadTheme from './templates/MadTheme.mjs';
export default class TrueManga extends MadTheme {
    constructor() {
        super();
        super.id = 'truemanga';
        super.label = 'TrueManga';
        this.tags = ['manga', 'webtoon', 'english'];
        this.url = 'https://truemanga.com';
    }
    async _getPages(chapter) {
        const request = new Request(this.url + chapter.id, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.chapter-image source');
        return data.map(element => this.createConnectorURI(this.getAbsolutePath(element.dataset['src'], request.url)));
    }
}