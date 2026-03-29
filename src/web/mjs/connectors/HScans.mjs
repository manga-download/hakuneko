import WordPressMadara from './templates/WordPressMadara.mjs';

export default class HScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'hscans';
        super.label = 'HSCANS';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://hscans.com';
    }
}