import WordPressMadara from './templates/WordPressMadara.mjs';

export default class WebtoonTRCOM extends WordPressMadara {

    constructor() {
        super();
        super.id = 'webtoontrcom';
        super.label = 'Webtoon TR';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://webtoon-tr.com';

        this.requestOptions.headers.set('x-referer', this.url);
    }
}