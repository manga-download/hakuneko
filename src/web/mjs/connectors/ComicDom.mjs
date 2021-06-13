import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ComicDom extends WordPressMadara {

    constructor() {
        super();
        super.id = 'comicdom';
        super.label = 'ComicDom';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://comicdom.org';

        this.queryMangas = 'div.post-title h3 a:last-of-type';
    }
}