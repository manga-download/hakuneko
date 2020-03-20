import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaKiss extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangakiss';
        super.label = 'Mangakiss';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://mangakiss.org';
    }
}