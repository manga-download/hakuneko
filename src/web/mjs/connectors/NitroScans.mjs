import WordPressMadara from './templates/WordPressMadara.mjs';

export default class NitroScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'nitroscans';
        super.label = 'Dark Scans';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://darkscans.com';
    }
}
