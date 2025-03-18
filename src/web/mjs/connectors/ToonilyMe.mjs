import MadTheme from './templates/MadTheme.mjs';

export default class ToonilyMe extends MadTheme {
    constructor() {
        super();
        super.id = 'toonilyme';
        super.label = 'ToonilyMe Manga';
        this.tags = ['webtoon', 'english'];
        this.url = 'https://toonily.me';
    }

    async _getChapters(manga) {
        let request = new Request(this.url + manga.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'ul#chapter-list > li > a');
        return data.map(element => {
            let titleElement = element.querySelector('strong.chapter-title');
            let chapterTitle = titleElement ? titleElement.textContent.trim() : element.text.trim();
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: chapterTitle,
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(this.url + chapter.id, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.chapter-image source');
        return data.map(element => this.createConnectorURI(this.getAbsolutePath(element, request.url)));
    }

}
