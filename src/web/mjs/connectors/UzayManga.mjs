import WordPressMadara from './templates/WordPressMadara.mjs';

export default class UzayManga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'uzaymanga';
        super.label = 'Uzay Manga';
        this.tags = [ 'webtoon', 'turkish', 'scanlation' ];
        this.url = 'https://uzaymanga.com';
        this.requestOptions.headers.set('x-referer', this.url);
    }
}