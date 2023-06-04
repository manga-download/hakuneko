import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Ainzscans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'ainzscans';
        super.label = 'Ainz Scans';
        this.tags = [ 'webtoon', 'indonesian', 'scanlation' ];
        this.url = 'https://ainzscans.site';
        this.path = '/series/list-mode';
    }
}
