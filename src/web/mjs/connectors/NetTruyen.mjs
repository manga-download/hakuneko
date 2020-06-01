import MojoPortalComic from './templates/MojoPortalComic.mjs';

export default class NetTruyen extends MojoPortalComic {

    constructor() {
        super();
        super.id = 'nettruyen';
        super.label = 'NetTruyen';
        this.tags = [ 'manga', 'webtoon', 'vietnamese' ];
        this.url = 'http://www.nettruyen.com';
    }
}