import WordPressMadara from './templates/WordPressMadara.mjs';

export default class BakaMan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'bakaman';
        super.label = 'BAKAMAN';
        this.tags = [ 'manga', 'webtoon', 'thai' ];
        this.url = 'https://bakaman.net';
    }
}