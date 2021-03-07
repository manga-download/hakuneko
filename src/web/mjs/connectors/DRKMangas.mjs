import WordPressMadara from './templates/WordPressMadara.mjs';

export default class DRKMangas extends WordPressMadara {

    constructor() {
        super();
        super.id = 'drkmangas';
        super.label = 'DRK Mangas';
        this.tags = [ 'manga', 'webtoon', 'portuguese' ];
        this.url = 'https://drkmangas.site';
    }
}