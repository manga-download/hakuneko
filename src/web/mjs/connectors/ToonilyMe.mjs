import MadTheme from './templates/MadTheme.mjs';

export default class ToonilyMe extends MadTheme {
    constructor() {
        super();
        super.id = 'toonilyme';
        super.label = 'ToonilyMe';
        this.tags = ['webtoon', 'english'];
        this.url = 'https://toonily.me';
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'ul#chapter-list > li > a');
        return data.map(element => {

            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title:element.querySelector(this.queryChapterTitle).textContent.trim(),
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.chapter-image source');
        return data.map(element => this.createConnectorURI(element.dataset.src));
    }
}
