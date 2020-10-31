import WordPressMadara from './templates/WordPressMadara.mjs';

export default class CrazyScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'crazyscans';
        super.label = 'Crazy Scans';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://mangacultivator.com';
    }
}