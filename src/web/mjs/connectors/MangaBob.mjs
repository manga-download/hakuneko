import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaBob extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangabob';
        super.label = 'MangaBob';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://mangabob.com';
    }
}