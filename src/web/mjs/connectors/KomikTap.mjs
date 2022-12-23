import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class KomikTap extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'komiktap';
        super.label = 'KomikTap';
        this.tags = [ 'manga', 'webtoon', 'hentai', 'indonesian' ];
        this.url = 'https://92.87.6.124';
        this.path = '/manga/list-mode/';
    }

    canHandleURI(uri) {
        return /komiktap\.in|194\.233\.66\.232|92\.87\.6\.124/.test(uri.hostname);
    }
}
