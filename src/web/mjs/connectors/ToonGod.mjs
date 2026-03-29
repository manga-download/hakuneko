import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ToonGod extends WordPressMadara {

    constructor() {
        super();
        super.id = 'toongod';
        super.label = 'ToonGod';
        this.tags = [ 'webtoon', 'hentai', 'english' ];
        this.url = 'https://www.toongod.com';
    }
}