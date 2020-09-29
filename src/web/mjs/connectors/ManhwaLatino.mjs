import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ManhwaLatino extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manhwalatino';
        super.label = 'Manhwa-Latino';
        this.tags = [ 'webtoon', 'hentai', 'spanish' ];
        this.url = 'https://manhwa-latino.com';
    }
}