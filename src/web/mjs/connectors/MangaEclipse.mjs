import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaEclipse extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangaeclipse';
        super.label = 'Manga Eclipse';
        this.tags = ['webtoon', 'english'];
        this.url = 'https://mangaeclipse.com';

        this.requestOptions.headers.set('x-referer', this.url);
    }

}