import WordPressMadara from './templates/WordPressMadara.mjs';

export default class DragonTranslation extends WordPressMadara {

    constructor() {
        super();
        super.id = 'dragontranslation';
        super.label = 'DragonTranslation';
        this.tags = [ 'webtoon', 'hentai', 'spanish' ];
        this.url = 'https://dragontranslation.net';
        this.queryMangas = 'div.series-box a';
        this.queryChapters ='li.wp-manga-chapter a';
        this.queryChaptersTitleBloat = 'span';
        this.queryPages = 'div#chapter_imgs source';
    }

    _createMangaRequest(page) {
        return new Request(new URL(`/mangas?page=${page}`, this.url), this.requestOptions);
    }
}
