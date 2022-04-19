import WordPressMadara from './templates/WordPressMadara.mjs';

export default class TheGuildScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'theguildscans';
        super.label = 'The Guild Scans';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://theguildscans.com';
    }
}
