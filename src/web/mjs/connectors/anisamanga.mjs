import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Anisamanga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'anisamanga';
        super.label = 'Anisa manga';
        this.tags = [ 'manga', 'webtoon', 'turkish' ];
        this.url = 'https://anisamanga.com';
    }
}