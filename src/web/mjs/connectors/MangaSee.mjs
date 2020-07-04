import MangaLife from './MangaLife.mjs';

export default class MangaSee extends MangaLife {

    constructor() {
        super();
        super.id = 'mangasee';
        super.label = 'MangaSee';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://mangasee123.com';
    }
}