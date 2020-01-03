import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaReceh extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangareceh';
        super.label = 'Mangareceh';
        this.tags = [ 'webtoon', 'indonesian' ];
        this.url = 'https://mangareceh.id';
    }
}