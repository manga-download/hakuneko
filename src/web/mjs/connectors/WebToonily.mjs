import WordPressMadara from './templates/WordPressMadara.mjs';

export default class WebToonily extends WordPressMadara {

    constructor() {
        super();
        super.id = 'webtoonily';
        super.label = 'WebToonily';
        this.tags = [ 'webtoon', 'hentai', 'english' ];
        this.url = 'https://webtoonily.com';
    }
}