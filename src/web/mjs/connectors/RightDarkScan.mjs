import WordPressMadara from './templates/WordPressMadara.mjs';

export default class RightDarkScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'rightdarkscan';
        super.label = 'RightDarkScan';
        this.tags = [ 'manga', 'spanish', 'webtoon' ];
        this.url = 'https://rightdark-scan.com';
    }
}