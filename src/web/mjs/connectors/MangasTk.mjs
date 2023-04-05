import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangasTk extends WordPressMadara {
    constructor() {
        super();
        super.id = 'mangastk';
        super.label = 'MangasTk';
        this.tags = [ 'webtoon', 'manga', 'spanish' ];
        this.url = 'https://mangastk.net';
        this.queryChaptersTitleBloat = 'span.chapter-release-date';
        this.queryChapters = 'li.wp-manga-chapter a';
    }

    async _getMangasFromPage(page) {
        let request = this._createMangaRequest(page);
        let data = await this.fetchDOM(request, 'div.series-box > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.queryselector('.series-title').textContent.trim()
            };
        });
    }

}