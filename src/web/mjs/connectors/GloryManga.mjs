import WordPressMadara from './templates/WordPressMadara.mjs';

export default class GloryManga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'glorymanga';
        super.label = 'GloryManga';
        this.tags = [ 'manga', 'webtoon', 'turkish' ];
        this.url = 'https://glorymanga.com';
    }
}