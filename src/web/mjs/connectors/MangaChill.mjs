import WordPressMadara from './templates/WordPressMadara.mjs';
export default class MangaChill extends WordPressMadara {
    constructor() {
        super();
        super.id = 'mangachill';
        super.label = 'MangaChill';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://manga-chill.com';
    }
}
