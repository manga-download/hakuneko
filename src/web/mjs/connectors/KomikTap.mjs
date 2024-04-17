import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class KomikTap extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'komiktap';
        super.label = 'KomikTap';
        this.tags = [ 'manga', 'webtoon', 'hentai', 'indonesian' ];
        this.url = 'https://komiktap.me';
        this.path = '/manga/list-mode/';
    }
}
