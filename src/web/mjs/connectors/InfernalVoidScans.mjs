import Iken from './templates/Iken.mjs';

export default class InfernalVoidScans extends Iken {

    constructor() {
        super();
        super.id = 'infernalvoidscans';
        super.label = 'InfernalVoidScans';
        this.tags = [ 'webtoon', 'scanlation', 'english' ];
        this.url = 'https://hivetoon.com';
        this.requestOptions.headers.set('x-referer', this.url);
    }
}
