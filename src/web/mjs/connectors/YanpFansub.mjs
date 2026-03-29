import WordPressMadara from './templates/WordPressMadara.mjs';

export default class YanpFansub extends WordPressMadara {

    constructor() {
        super();
        super.id = 'yanpfansub';
        super.label = 'Yanp Fansub';
        this.tags = [ 'manga', 'webtoon', 'portuguese', 'scanlation' ];
        this.url = 'https://yanpfansub.com';

    }
}
