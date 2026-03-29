import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class DiskusScan extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'diskusscan';
        super.label = 'Diskus Scan';
        this.tags = [ 'manga', 'webtoon', 'portuguese', 'scanlation' ];
        this.url = 'https://diskusscan.com';
        this.path = '/manga/list-mode';
    }
}
