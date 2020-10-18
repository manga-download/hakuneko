import WordPressMadara from './templates/WordPressMadara.mjs';

export default class mangasehri extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangasehri';
        super.label = 'mangasehri';
        this.tags = [ 'manga', 'turkish' ];
        this.url = 'https://mangasehri.com';
    }
}