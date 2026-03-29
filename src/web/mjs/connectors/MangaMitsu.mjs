import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaMitsu extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangamitsu';
        super.label = 'Manga Mitsu';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://mangamitsu.com';
    }
}