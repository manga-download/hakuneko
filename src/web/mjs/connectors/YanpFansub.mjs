import WordPressMadara from './templates/WordPressMadara.mjs';

export default class YapFansub extends WordPressMadara {

    constructor() {
        super();
        super.id = 'yapfansub';
        super.label = 'Yap Fansub';
        this.tags = [ 'manga', 'webtoon', 'portuguese', 'scanlation' ];
        this.url = 'https://yanpfansub.com';

    }
}