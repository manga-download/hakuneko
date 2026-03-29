import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaNine extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manganine';
        super.label = 'Manga Nine';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://manganine.com';
    }
}