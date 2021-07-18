import MojoPortalComic from './templates/MojoPortalComic.mjs';

export default class MangaToroVI extends MojoPortalComic {

    constructor() {
        super();
        super.id = 'mangatoro-vi';
        super.label = 'MangaToro (VI)';
        this.tags = [ 'manga', 'webtoon', 'vietnamese' ];
        this.url = 'https://vi.mangatoro.com';
        this.links = {
            login: this.url + '/Secure/Login.aspx'
        };
    }
}