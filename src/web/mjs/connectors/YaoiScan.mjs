import WordPressMadara from './templates/WordPressMadara.mjs';

export default class YaoiScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'yaoiscan';
        super.label = 'YaoiScan';
        this.tags = [ 'webtoon', 'hentai', 'english' ];
        this.url = 'https://yaoiscan.com';
    }
}
