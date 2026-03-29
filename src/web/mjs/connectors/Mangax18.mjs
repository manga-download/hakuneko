import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Mangax18 extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangax18';
        super.label = 'Mangax18';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://mangax18.com';
    }
}