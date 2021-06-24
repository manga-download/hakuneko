import MojoPortalComic from './templates/MojoPortalComic.mjs';

export default class MangaNT extends MojoPortalComic {

    constructor() {
        super();
        super.id = 'mangant';
        super.label = 'MangaToro';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://www.mangatoro.com';
    }
}