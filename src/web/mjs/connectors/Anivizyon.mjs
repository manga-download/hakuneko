import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Anivizyon extends WordPressMadara {

    constructor() {
        super();
        super.id = 'anivizyon';
        super.label = 'Anivizyon';
        this.tags = [ 'webtoon', 'turkish' ];
        this.url = 'https://www.anivizyon.com';
    }
}