import MojoPortalComic from './templates/MojoPortalComic.mjs';

export default class MangaNT extends MojoPortalComic {

    constructor() {
        super();
        super.id = 'mangant';
        super.label = 'MangaNT';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://mangant.com';
    }
}