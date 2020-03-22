import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ChibiManga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'chibimanga';
        super.label = 'ChibiManga';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'http://www.cmreader.info';
    }
}