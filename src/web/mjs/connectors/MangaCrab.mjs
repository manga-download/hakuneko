import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaCrab extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangacrab';
        super.label = 'Manga Crab';
        this.tags = [ 'webtoon', 'spanish' ];
        this.url = 'https://mangacrab.com';
    }
}