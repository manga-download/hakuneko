import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaNato extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manga-nato';
        super.label = 'MangaNato';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://manga-nato.com';
    }
}