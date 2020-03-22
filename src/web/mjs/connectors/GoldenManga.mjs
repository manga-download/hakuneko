import WordPressMadara from './templates/WordPressMadara.mjs';

export default class GoldenManga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'goldenmanga';
        super.label = 'المانجا الذهبية (Golden Manga)';
        this.tags = [ 'webtoon', 'arabic' ];
        this.url = 'https://golden-manga.com';
    }

    async _getChapters(manga) {
        let uri = new URL( manga.id, this.url );
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.page-content-listing div.main > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.querySelector('h6').textContent.trim(),
                language: ''
            };
        });
    }
}