import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class PatateScan extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'patatescan';
        super.label = 'Patatescans';
        this.tags = [ 'webtoon', 'hentai', 'french' ];
        this.url = 'https://patatescans.com';
        this.path = '/manga/list-mode/';
    }
}
