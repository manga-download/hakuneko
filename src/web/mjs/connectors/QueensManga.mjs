import WordPressMadara from './templates/WordPressMadara.mjs';

export default class QueensManga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'queensmanga';
        super.label = 'ملكات المانجا (Queens Manga)';
        this.tags = [ 'webtoon', 'arabic' ];
        this.url = 'https://queensmanga.com';

        this.queryPages = 'div.page-break picture source[srcset]';
    }

    async _getChapters(manga) {
        let uri = new URL(manga.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'ul li.wp-manga-chapter');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.closest('a'), request.url),
                title: [...element.childNodes].map(node => node.textContent.trim()).find(text => text.length > 0),
                language: ''
            };
        });
    }
}