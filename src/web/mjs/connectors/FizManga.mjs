import WordPressMadara from './templates/WordPressMadara.mjs';
export default class FizManga extends WordPressMadara {
    constructor() {
        super();
        super.id = 'fizmanga';
        super.label = 'FizManga';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://fizmanga.com';
    }
}