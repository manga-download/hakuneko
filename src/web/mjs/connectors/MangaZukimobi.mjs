import WordPressZbulu from './templates/WordPressZbulu.mjs';

export default class MangaZukimobi extends WordPressZbulu {

    constructor() {
        super();
        super.id = 'mangazukimobi';
        super.label = 'MangaZukimobi';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'http://mangazuki.mobi';
        this.path = '/popular-manga';
        this.pathMangas = '?page=%PAGE%';
        this.pathChapters = '';

        this.queryMangasPageCount = 'div.pagination-container ul.pagination li:nth-last-of-type(2) a';
        this.queryChapters = 'div#chapterList div.chapters-wrapper div.r1 a.chap';
    }

    // Exactly same "protection" as in AnyACG template
    async _getPages(chapter) {
        let uri = new URL(chapter.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.container-chap p#arraydata');
        return data[0].textContent.split(',').map(link => this.getAbsolutePath(link.trim(), request.url));
    }
}