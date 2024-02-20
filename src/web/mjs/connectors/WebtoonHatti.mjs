import WordPressMadara from './templates/WordPressMadara.mjs';

export default class WebtoonHatti extends WordPressMadara {

    constructor() {
        super();
        super.id = 'webtoonhatti';
        super.label = 'Webtoon Hatti';
        this.tags = [ 'webtoon', 'turkish' ];
        this.url = 'https://webtoonhatti.net';
        this.queryPages = 'div.page-break:not([style*="display:"]) source';
    }
}
