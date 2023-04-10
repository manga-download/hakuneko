import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ManhuaPlus extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manhuaplus';
        super.label = 'ManhuaPlus';
        this.tags = [ 'webtoon', 'vietnamese' ];
        this.url = 'https://manhuaplus.com';

        this.queryPages = 'figure source, div.page-break source, div.chapter-video-frame source, div.reading-content p source';
        this.requestOptions.headers.set('x-referer', this.url);
        this.requestOptions.headers.set('x-origin', this.url);
        this.requestOptions.headers.set('x-user-agent', 'Mozilla/5.0 (Windows NT 10.0; rv:111.0) Gecko/20100101 Firefox/111.0');
    }
}
