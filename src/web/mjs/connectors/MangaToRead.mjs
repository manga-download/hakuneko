import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaToRead extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangatoread';
        super.label = 'MangaToRead';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://mangatoread.com';

        this.requestOptions.headers.set('x-referer', this.url);
    }
}