import WordPressMadara from './templates/WordPressMadara.mjs';
export default class MangaChill extends WordPressMadara {
    constructor() {
        super();
        super.id = 'webcomicme';
        super.label = 'WebComic (Webcomic.me)';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://webcomic.me';
    }
}