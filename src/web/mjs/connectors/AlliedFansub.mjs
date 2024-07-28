import WordPressMadara from './templates/WordPressMadara.mjs';

export default class AlliedFansub extends WordPressMadara {

    constructor() {
        super();
        super.id = 'alliedfansub';
        super.label = 'Allied Fansub';
        this.tags = [ 'webtoon', 'turkish', 'scanlation' ];
        this.url = 'https://alliedfansub.net';
        this.requestOptions.headers.set('x-referer', this.url);
    }
}
