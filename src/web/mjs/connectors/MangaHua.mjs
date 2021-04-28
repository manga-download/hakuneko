import MojoPortalComic from './templates/MojoPortalComic.mjs';

export default class MangaHua extends MojoPortalComic {

    constructor() {
        super();
        super.id = 'mangahua';
        super.label = 'Mangahua';
        this.tags = [ 'manga', 'webtoon', 'english', 'raw' ];
        this.url = 'https://mangahua.com';
        this.links = {
            login: 'https://mangahua.com/Secure/Login.aspx'
        };
    }
}