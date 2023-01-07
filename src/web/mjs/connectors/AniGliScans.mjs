import WordPressMangastream from './templates/WordPressMangastream.mjs';
export default class AniGliScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'anigliscans';
        super.label = 'Animated Glitched Scans';
        this.tags = [ 'manga', 'english', 'scanlation' ];
        this.url = 'https://anigliscans.com';
        this.path = '/series/?list';
    }
}
