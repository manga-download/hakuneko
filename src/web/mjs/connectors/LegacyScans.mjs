import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class LegacyScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'legacyscans';
        super.label = 'Legacy-Scans';
        this.tags = ['webtoon', 'french'];
        this.url = 'https://legacy-scans.com';
        this.path = '/manga/list-mode/';
    }
}
