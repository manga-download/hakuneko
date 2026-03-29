import WordPressMadara from './templates/WordPressMadara.mjs';
export default class Manga1st extends WordPressMadara {
    constructor() {
        super();
        super.id = 'manga1st';
        super.label = 'MangaVisa';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://mangavisa.com';
    }

    _createMangaRequest(page) {
        return new Request(new URL(`/manga/page/${page}/`, this.url), this.requestOptions);
    }
}