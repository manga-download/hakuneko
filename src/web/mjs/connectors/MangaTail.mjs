import MangaSail from './MangaSail.mjs';

export default class MangaTail extends MangaSail {

    constructor() {
        super();
        super.id = 'mangatail';
        super.label = 'MangaTail';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://www.mangatail.me';
    }
}