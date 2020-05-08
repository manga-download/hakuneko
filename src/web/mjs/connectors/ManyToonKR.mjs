import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ManyToonKR extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manytoonkr';
        super.label = 'ManyToonKR';
        this.tags = [ 'webtoon', 'hentai', 'raw', 'korean' ];
        this.url = 'https://manytoon.club';
    }
}