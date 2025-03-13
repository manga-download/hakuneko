import WordPressMadara from './templates/WordPressMadara.mjs';

export default class HARIMANGA extends WordPressMadara {

    constructor() {
        super();
        super.id = 'HARIMANGA';
        super.label = 'HARIMANGA';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://harimanga.me';
    }

    _createMangaRequest(page) {
        return new Request(new URL(`/manga/page/${page}/`, this.url), this.requestOptions);
    }
}
