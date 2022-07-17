import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Dalsei extends WordPressMadara {

    constructor() {
        super();
        super.id = 'dalsei';
        super.label = 'Dalsei';
        this.tags = [ 'webtoon', 'turkish', 'scanlation' ];
        this.url = 'https://dalsei.com';
    }
}