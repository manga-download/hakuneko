import MojoPortalComic from './templates/MojoPortalComic.mjs';

export default class NetTruyen extends MojoPortalComic {

    constructor() {
        super();
        super.id = 'nettruyen';
        super.label = 'NetTruyen';
        this.tags = [ 'manga', 'webtoon', 'vietnamese' ];
        this.url = 'http://www.nettruyenvip.com';
        this.links = {
            login: 'http://www.nettruyenvip.com/Secure/Login.aspx'
        };
    }
}