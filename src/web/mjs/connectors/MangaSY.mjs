import WordPressMadara from './templates/WordPressMadara.mjs';

/**
 *
 */
export default class MangaSY extends WordPressMadara {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangasy';
        super.label = 'Manga SY';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://www.mangasy.com';
    }
}