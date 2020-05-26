import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Mangabaz extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangabaz';
        super.label = 'Mangabaz';
        this.tags = [ 'manga', 'webtoon', 'turkish' ];
        this.url = 'https://mangabaz.com';
    }
}