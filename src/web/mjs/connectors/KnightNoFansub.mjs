import WordPressMadara from './templates/WordPressMadara.mjs';

export default class KnightNoFansub extends WordPressMadara {

    constructor() {
        super();
        super.id = 'knightnofansub';
        super.label = 'Knight no Fansub';
        this.tags = [ 'webtoon', 'high-quality', 'spanish', 'scanlation' ];
        this.url = 'https://lectorkns.com';
        this.requestOptions.headers.set('x-referer', this.uri);
    }
}
