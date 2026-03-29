import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaEffect extends WordPressMadara {
    constructor() {
        super();
        super.id = 'mangaeffect';
        super.label = 'MangaEffect';
        this.tags = [ 'manga', 'scanlation', 'english' ];
        this.url = 'https://mangaeffect.com';
    }

    _createMangaRequest(page) {
        return new Request(new URL(`/manga/page/${page}/`, this.url), this.requestOptions);
    }
}
