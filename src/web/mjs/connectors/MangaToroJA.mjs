import MojoPortalComic from './templates/MojoPortalComic.mjs';

export default class MangaToroJA extends MojoPortalComic {

    constructor() {
        super();
        super.id = 'mangatoro-ja';
        super.label = 'MangaToro (JA)';
        this.tags = [ 'manga', 'webtoon', 'japanese' ];
        this.url = 'https://ja.mangatoro.com';
        this.links = {
            login: this.url + '/Secure/Login.aspx'
        };
    }
}