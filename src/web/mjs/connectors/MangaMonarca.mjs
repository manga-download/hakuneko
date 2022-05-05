import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaMonarca extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangamonarca';
        super.label = 'Monarcamanga';
        this.tags = [ 'webtoon', 'spanish' ];
        this.url = 'https://monarcamanga.com';
    }
}