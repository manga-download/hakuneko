import WordPressMadara from './templates/WordPressMadara.mjs';

export default class BetaFox extends WordPressMadara {

    constructor() {
        super();
        super.id = 'betafox';
        super.label = 'Beta Fox';
        this.tags = [ 'manga', 'webtoon', 'hentai', 'english' ];
        this.url = 'https://www.betafox.net';
        this.requestOptions.headers.set('x-referer', this.url);
    }
}