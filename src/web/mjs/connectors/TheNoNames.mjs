import Genkan from './templates/Genkan.mjs';

export default class TheNoNames extends Genkan {

    constructor() {
        super();
        super.id = 'thenonames';
        super.label = 'The Nonames Scans';
        this.tags = [ 'webtoon', 'english', 'scanlation' ];
        this.url = 'https://the-nonames.com';
    }
}