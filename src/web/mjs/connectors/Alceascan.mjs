import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Alceascan extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'alceascan';
        super.label = 'Alceascan';
        this.tags = ['manga', 'indonesian', 'scanlation'];
        this.url = 'https://alceascan.my.id';
        this.path = '/manga/list-mode/';
    }
}
