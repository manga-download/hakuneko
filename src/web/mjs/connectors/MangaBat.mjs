import MangaNel from './MangaNel.mjs';

export default class MangaBat extends MangaNel {

    constructor() {
        super();
        super.id = 'mangabat';
        super.label = 'MangaBat';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://mangabat.com';

        this.path = '/manga-list-all/';
        this.queryMangas = 'div.panel-list-story div.list-story-item h3 a.item-title';
    }
}