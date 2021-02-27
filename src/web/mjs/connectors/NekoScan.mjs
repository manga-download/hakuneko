import WordPressMadara from './templates/WordPressMadara.mjs';

export default class NekoScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'nekoscan';
        super.label = 'NEKOSCAN';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://nekoscan.com';

        this.queryPages = 'div.page-break source, div.text-left p source';
    }
}