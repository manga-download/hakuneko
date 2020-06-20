import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ManhwaPool extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manhwapool';
        super.label = 'ManhwaPool';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://manhwapool.com';
    }
}