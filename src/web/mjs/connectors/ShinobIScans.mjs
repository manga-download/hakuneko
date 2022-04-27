import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ShinobiScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'shinobiscans';
        super.label = 'ShinobiScans';
        this.tags = [ 'webtoon', 'italian', 'scanlation' ];
        this.url = 'https://shinobiscans.com';

        this.requestOptions.headers.set('x-referer', this.url);
    }
}