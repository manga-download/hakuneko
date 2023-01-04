import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class AniGlitchScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'aniglitchscans';
        super.label = 'Animated Glitched Scans';
        this.tags = ['manga', 'webtoon', 'english', 'scanlation'];
        this.url = 'https:/anigliscans.com';
        this.path = '/manga/list-mode/';

    }
}
