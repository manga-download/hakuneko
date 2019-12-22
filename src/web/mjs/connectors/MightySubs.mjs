import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MightySubs extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mightysubs';
        super.label = 'MightySubs';
        this.tags = [ 'webtoon', 'turkish' ];
        this.url = 'https://www.mightyfansub.com';
    }
}