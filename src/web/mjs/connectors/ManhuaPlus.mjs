import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ManhuaPlus extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manhuaplus';
        super.label = 'ManhuaPlus';
        this.tags = [ 'webtoon', 'vietnamese' ];
        this.url = 'https://manhuaplus.com';

        this.queryPages = 'figure source, div.page-break source, div.chapter-video-frame source, div.reading-content p source';
    }
}