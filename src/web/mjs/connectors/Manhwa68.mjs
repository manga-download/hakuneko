import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Manhwa68 extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manhwa68';
        super.label = 'Manhwa68';
        this.tags = [ 'manga', 'webtoon', 'english', 'hentai' ];
        this.url = 'https://manhwa68.com';
    }
}