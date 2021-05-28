import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ReadWebtoons extends WordPressMadara {

    constructor() {
        super();
        super.id = 'readwebtoons';
        super.label = 'WebtoonUpdates';
        this.tags = [ 'webtoon', 'hentai', 'english' ];
        this.url = 'https://webtoonupdates.com';

        this.queryPages = 'div.reading-content p source, div.reading-content div.page-break source';
    }
}