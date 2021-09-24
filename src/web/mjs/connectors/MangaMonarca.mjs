import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaMonarca extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangamonarca';
        super.label = 'MangaMonarca';
        this.tags = [ 'webtoon', 'spanish' ];
        this.url = 'https://mangamonarca.xyz';
    }
}