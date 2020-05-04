import WordPressMadara from './templates/WordPressMadara.mjs';

export default class AdonisFansub extends WordPressMadara {

    constructor() {
        super();
        super.id = 'yayutoon';
        super.label = 'YAYUTOON';
        this.tags = [ 'webtoon', 'turkish' ];
        this.url = 'https://yayutoon.fun';

        this.language = 'tr';
    }
}