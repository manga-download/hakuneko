import MojoPortalComic from './templates/MojoPortalComic.mjs';

export default class TruyenChon extends MojoPortalComic {

    constructor() {
        super();
        super.id = 'truyenchon';
        super.label = 'TruyenChon';
        this.tags = [ 'manga', 'webtoon', 'vietnamese' ];
        this.url = 'http://truyenchon.com';
    }
}