import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Mangacim extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangacim';
        super.label = 'Mangacim';
        this.tags = [ 'manga', 'webtoon', 'turkish' ];
        this.url = 'https://www.mangacim.com';
    }
}