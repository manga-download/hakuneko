import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class KumaScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'kumascans';
        super.label = 'Kuma Scans';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://kumascans.com';
        this.path = '/manga/list-mode/';
    }
}