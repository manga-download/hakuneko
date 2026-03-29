import WordPressMadara from './templates/WordPressMadara.mjs';

export default class SumManga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'summanga';
        super.label = 'SumManga';
        this.tags = [ 'manga', 'english', 'webtoon' ];
        this.url = 'https://summanga.com';
    }
}