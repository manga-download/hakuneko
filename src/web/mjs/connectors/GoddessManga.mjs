import WordPressMadara from './templates/WordPressMadara.mjs';

export default class GoddessManga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'goddessmanga';
        super.label = 'GoddessManga';
        this.tags = [ 'manga', 'webtoon', 'turkish' ];
        this.url = 'https://goddessmanga.com';
    }
}