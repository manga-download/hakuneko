import WordPressMadara from './templates/WordPressMadara.mjs';

export default class LittleMonsterScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'littlemonsterscan';
        super.label = 'Little Monster Scan';
        this.tags = [ 'manga', 'webtoon', 'portuguese' ];
        this.url = 'https://littlemonsterscan.com.br';
    }
}