import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class LegionAsia extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'legionasia';
        super.label = 'LegionAsia';
        this.tags = [ 'webtoon', 'spanish' ];
        this.url = 'https://legionasia.com';
        this.path = '/manga/list-mode/';
    }
}