import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ManhuaUs extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manhuaus';
        super.label = 'Manhua Us';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://manhuaus.com';

        this.queryPages = 'ul.blocks-gallery-grid li.blocks-gallery-item source';
    }
}