import WordPressMadara from './templates/WordPressMadara.mjs';

export default class KumoTran extends WordPressMadara {

    constructor() {
        super();
        super.id = 'kumotran';
        super.label = 'KumoTran';
        this.tags = [ 'manga', 'webtoon', 'thai' ];
        this.url = 'https://www.kumotran.com';

        this.queryPages = 'div.reading-content source, div.reading-content canvas';
    }
}