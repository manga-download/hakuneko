import WordPressMadara from './templates/WordPressMadara.mjs';

export default class BirManga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'birmanga';
        super.label = 'Bir Manga';
        this.tags = [ 'webtoon', 'turkish' ];
        this.url = 'https://birmanga.com';
    }
}