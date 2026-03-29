import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaRead extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangaread';
        super.label = 'MangaRead';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://www.mangaread.org';
    }
}