import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class PhoenixFansub extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'phoenixfansub';
        super.label = 'Phoenix Fansub';
        this.tags = [ 'manga', 'webtoon', 'spanish' ];
        this.url = 'https://phoenixfansub.com';
        this.path = '/manga/list-mode/';
    }
}