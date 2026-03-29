import WordPressMadara from './templates/WordPressMadara.mjs';

export default class WebtoonTRCOM extends WordPressMadara {

    constructor() {
        super();
        super.id = 'webtoontrcom';
        super.label = 'WebtoonTR.NET';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://webtoontr.net';

        this.requestOptions.headers.set('x-referer', this.url);
    }
}
