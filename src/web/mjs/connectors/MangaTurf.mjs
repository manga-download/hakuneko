import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaTurf extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangaturf';
        super.label = 'Manga Turf';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://mangaturf.com';
    }
}