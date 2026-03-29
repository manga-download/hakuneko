import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaGreat extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangagreat';
        super.label = 'MANGAGREAT';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://mangagreat.org';

        this.queryPages = 'div.read-container source';
    }
}
