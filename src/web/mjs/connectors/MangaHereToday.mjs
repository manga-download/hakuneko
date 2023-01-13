import AnyACG from './templates/AnyACG.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaHereToday extends AnyACG {
    constructor() {
        super();
        super.id = 'mangaheretoday';
        super.label = 'MangaHereToday';
        this.tags = [ 'manga', 'english' ];
        this.url = 'http://mangahere.today';
        this.queryMangas = 'div.row div.media-body';
        this.queryMangaLink = 'a';
        this.queryChapters = 'div.total-chapter:nth-of-type(4) h4 a';
        this.queryPages = 'div.chapter-content-inner p#arraydata';
        this.queryMangaTitle = 'div.media-body';
        this.queryMangaTitleText = 'h1.title-manga';
    }
    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangaTitle);
        let id = uri.pathname + uri.search;
        //HACK We need to remove trailing "Manga" from the title
        let title = data[0].querySelector(this.queryMangaTitleText).textContent.replace(/\s+Manga$/i, '').trim();
        return new Manga(this, id, title);
    }
}
