import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class ChiOtaku extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'chiotaku';
        super.label = 'ChiOtaku';
        this.tags = [ 'manga', 'webtoon', 'indonesian' ];
        this.url = 'https://chiotaku.com';
        this.path = '/manga/?list';
    }
}