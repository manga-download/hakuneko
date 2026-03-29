import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaHane extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangahane';
        super.label = 'Manga Hane';
        this.tags = [ 'webtoon', 'turkish' ];
        this.url = 'https://manga-hane.com';
    }
}
