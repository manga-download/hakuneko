import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Okamiyomi extends WordPressMadara {

    constructor() {
        super();
        super.id = 'okamiyomi';
        super.label = 'Okamiyomi';
        this.tags = [ 'webtoon', 'portuguese' ];
        this.url = 'https://okamiyomi.com';
    }
}