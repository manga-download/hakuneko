import WordPressMadara from './templates/WordPressMadara.mjs';

export default class GuncelManga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'guncelmanga';
        super.label = 'Güncel Manga';
        this.tags = [ 'manga', 'turkish' ];
        this.url = 'https://guncelmanga.com';
    }
}