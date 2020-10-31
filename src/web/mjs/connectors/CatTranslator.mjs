import WordPressMadara from './templates/WordPressMadara.mjs';

export default class CatTranslator extends WordPressMadara {

    constructor() {
        super();
        super.id = 'cat-translator';
        super.label = 'Cat-Translator';
        this.tags = [ 'manga', 'webtoon', 'thai' ];
        this.url = 'https://cat-translator.com';
        this.path = '/manga';
    }
}