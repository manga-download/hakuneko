import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class ShootingStarScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'shootingstarscans';
        super.label = 'Shooting Star Scans';
        this.tags = [ 'webtoon', 'english', 'scanlation' ];
        this.url = 'https://shootingstarscans.com';
        this.path = '/manga/list-mode/';
    }
}