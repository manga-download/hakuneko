import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ReadWebtoons extends WordPressMadara {

    constructor() {
        super();
        super.id = 'readwebtoons';
        super.label = 'ReadWebtoons';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://readwebtoons.com';

        this.queryPages = 'div.reading-content p source';
    }
}