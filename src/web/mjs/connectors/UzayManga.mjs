import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class UzayManga extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'uzaymanga';
        super.label = 'Uzay Manga';
        this.tags = [ 'webtoon', 'turkish', 'scanlation' ];
        this.url = 'https://uzaymanga.com';
        this.path = '/manga/list-mode/';
        this.requestOptions.headers.set('x-referer', this.url);
    }
}