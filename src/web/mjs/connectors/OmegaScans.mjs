import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class OmegaScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'omegascans';
        super.label = 'OmegaScans';
        this.tags = [ 'webtoon', 'scanlation', 'english', 'hentai'];
        this.url = 'https://omegascans.org';
        this.path = '/manga/list-mode/';
    }
}
