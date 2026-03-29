import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ManyToonCOM extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manytooncom';
        super.label = 'ManyToon';
        this.tags = [ 'manga', 'webtoon', 'hentai', 'english' ];
        this.url = 'https://manytoon.com';
    }
}