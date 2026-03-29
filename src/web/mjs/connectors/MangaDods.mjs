import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaDods extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangadods';
        super.label = 'MANGADODS';
        this.tags = [ 'webtoon', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://www.mangadods.com';
    }
}