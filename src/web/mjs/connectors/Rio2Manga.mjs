import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Rio2Manga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'rio2manga';
        super.label = 'Rio2Manga';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://rio2manga.com';
    }
}