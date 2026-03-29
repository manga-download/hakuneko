import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaRoma extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangaroma';
        super.label = 'Manga Roma';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://mangaroma.com';
    }
}