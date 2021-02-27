import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaYaku extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangayaku';
        super.label = 'MangaYaku';
        this.tags = [ 'webtoon', 'indonesian' ];
        this.url = 'https://mangayaku.my.id';
    }
}