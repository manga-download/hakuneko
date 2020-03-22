import WordPressMadara from './templates/WordPressMadara.mjs';

export default class KissmangaIN extends WordPressMadara {

    constructor() {
        super();
        super.id = 'kissmangain';
        super.label = 'Kissmanga';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://kissmanga.in';
    }
}