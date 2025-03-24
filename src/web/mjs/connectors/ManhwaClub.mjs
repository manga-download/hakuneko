import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ManhwaClub extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manhwaclub';
        super.label = 'ManhwaClub';
        this.tags = [ 'webtoon', 'hentai', 'multi-lingual' ];
        this.url = 'https://manhwaclub.net';
    }
}
