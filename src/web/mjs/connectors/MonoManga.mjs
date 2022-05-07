import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MonoManga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'monomanga';
        super.label = 'MonoManga';
        this.tags = [ 'webtoon', 'turkish', 'scanlation' ];
        this.url = 'https://monomanga.com';
        this.requestOptions.headers.set('x-referer', this.url);
    }
}