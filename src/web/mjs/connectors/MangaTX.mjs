import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaTX extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangatx';
        super.label = 'Mangatx';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://mangatx.to';
    }
}
