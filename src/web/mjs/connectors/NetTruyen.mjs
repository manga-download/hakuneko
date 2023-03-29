import MojoPortalComic from './templates/MojoPortalComic.mjs';

export default class NetTruyen extends MojoPortalComic {

    constructor() {
        super();
        super.id = 'nettruyen';
        super.label = 'NetTruyen';
        this.tags = [ 'manga', 'webtoon', 'vietnamese' ];
        this.url = 'https://www.nettruyenvi.com';
        this.links = {
            login: this.url + '/Secure/Login.aspx'
        };
    }
}
