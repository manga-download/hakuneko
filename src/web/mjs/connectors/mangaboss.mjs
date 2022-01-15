import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Mangaboss extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangaboss';
        super.label = 'Mangaboss';
        this.tags = [ 'manga', 'english', 'webtoon' ];
        this.url = 'https://mangaboss.org';
    }
}
