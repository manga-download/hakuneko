import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Manga41 extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manga41';
        super.label = 'Manga 41';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://manga41.com';
    }
}