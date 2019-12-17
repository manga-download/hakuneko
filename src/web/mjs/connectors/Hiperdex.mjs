import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Hiperdex extends WordPressMadara {

    constructor() {
        super();
        super.id = 'hiperdex';
        super.label = 'Hiperdex';
        this.tags = [ 'hentai', 'webtoon', 'english' ];
        this.url = 'https://hiperdex.com';
    }
}