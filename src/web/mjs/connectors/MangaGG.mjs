import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaGG extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangagg';
        super.label = 'MangaGG';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://mangagg.com';
        this.requestOptions.headers.set('x-referer', this.url);
    }
}