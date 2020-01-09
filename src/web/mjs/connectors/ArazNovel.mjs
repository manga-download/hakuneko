import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ArazNovel extends WordPressMadara {

    constructor() {
        super();
        super.id = 'araznovel';
        super.label = 'ArazNovel';
        this.tags = [ 'webtoon', 'turkish' ];
        this.url = 'https://www.araznovel.com';
    }
}