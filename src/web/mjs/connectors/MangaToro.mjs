import MojoPortalComic from './templates/MojoPortalComic.mjs';

export default class MangaToro extends MojoPortalComic {

    constructor() {
        super();
        super.id = 'mangatoro';
        super.label = 'MangaToro';
        this.tags = [ 'manga', 'webtoon', 'english', 'raw' ];
        this.url = 'https://www.mangatoro.com';
        this.links = {
            login: this.url + '/Secure/Login.aspx'
        };
    }
}