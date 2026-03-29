import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class ManhwaTaro extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'manhwataro';
        super.label = 'ManhwaTaro';
        this.tags = [ 'webtoon', 'hentai', 'indonesian' ];
        this.url = 'https://manhwataro.xyz';
        this.path = '/komik/list-mode/';
    }
}