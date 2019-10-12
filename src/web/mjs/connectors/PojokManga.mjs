import WordPressMadara from './templates/WordPressMadara.mjs';

export default class PojokManga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'pojokmanga';
        super.label = 'PojokManga';
        this.tags = [ 'manga', 'webtoon', 'indonesian' ];
        this.url = 'https://pojokmanga.com';
    }
}