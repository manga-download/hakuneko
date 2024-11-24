import WordPressMadara from './templates/WordPressMadara.mjs';

export default class RuyaManga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'ruyamanga';
        super.label = 'Rüya Manga';
        this.tags = [ 'manga', 'webtoon', 'turkish' ];
        this.url = 'https://www.ruya-manga.com';
    }
}
