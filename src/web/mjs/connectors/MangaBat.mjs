import MangaNel from './MangaNel.mjs';

export default class MangaBat extends MangaNel {

    constructor() {
        super();
        super.id = 'mangabat';
        super.label = 'MangaBat';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://mangabat.com';

        this.queryMangasPageCount = 'div.group-page a.page:last-of-type';
        this.queryMangas = 'div.list_category h3 a';
    }
}