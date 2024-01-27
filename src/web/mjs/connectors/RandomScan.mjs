import WordPressMadara from './templates/WordPressMadara.mjs';
export default class RandomScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'randomscan';
        super.label = 'Lura Toon';
        this.tags = [ 'manga', 'webtoon', 'portuguese' ];
        this.url = 'https://luratoon.com';
    }
}
