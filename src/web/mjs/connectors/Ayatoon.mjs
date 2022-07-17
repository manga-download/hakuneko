import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Ayatoon extends WordPressMadara {

    constructor() {
        super();
        super.id = 'ayatoon';
        super.label = 'AYATOON';
        this.tags = [ 'webtoon', 'turkish' ];
        this.url = 'https://ayatoon.com';
    }
}