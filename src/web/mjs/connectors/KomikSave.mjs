import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class KomikSave extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'komiksave';
        super.label = 'Komik Save';
        this.tags = [ 'webtoon', 'hentai', 'indonesian' ];
        this.url = 'https://komiksave.me';
        this.path = '/komik/list-mode/';
    }
}