import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaStarz extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangastarz';
        super.label = 'مانجا ستارز (Mangastarz)';
        this.tags = [ 'manga', 'webtoon', 'arabic' ];
        this.url = 'https://manga-starz.com';
    }
}
