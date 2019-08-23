import WordPressMadara from './templates/WordPressMadara.mjs';

export default class GrafiManga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'grafimanga';
        super.label = 'GrafiManga';
        this.tags = [ 'manga', 'webtoon', 'high-quality', 'spanish', 'scanlation' ];
        this.url = 'https://grafimanga.com';
    }
}