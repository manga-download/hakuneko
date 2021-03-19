import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaTitan extends WordPressMadara {
    constructor() {
        super();
        super.id = 'mangatitan';
        super.label = 'Manga-Titan';
        this.tags = [ 'manga', 'webtoon', 'hentai', 'thai' ];
        this.url = 'https://manga-titan.com';

        this.queryTitleForURI = 'div.profile-manga div.post-title h1';
    }
}