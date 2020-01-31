import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ManhwaHentai extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manhuas';
        super.label = 'Manhuas';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://manhuas.net';
    }
}