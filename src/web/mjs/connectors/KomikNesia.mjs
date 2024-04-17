import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class KomikNesia extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'komiknesia';
        super.label = 'KomikNesia';
        this.tags = [ 'manga', 'webtoon', 'indonesian' ];
        this.url = 'https://komiknesia.xyz';
        this.path = '/manga/list-mode';
    }
}
