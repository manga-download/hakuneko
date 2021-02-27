import WordPressMadara from './templates/WordPressMadara.mjs';

export default class S2Manga extends WordPressMadara {

    constructor() {
        super();
        super.id = 's2manga';
        super.label = 'S2Manga';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://s2manga.com';
    }
}