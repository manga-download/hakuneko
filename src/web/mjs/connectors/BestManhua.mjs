import WordPressMadara from './templates/WordPressMadara.mjs';

export default class BestManhua extends WordPressMadara {

    constructor() {
        super();
        super.id = 'bestmanhua';
        super.label = 'Best Manhua';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://bestmanhua.com';

        this.queryPages = 'ul.blocks-gallery-grid li.blocks-gallery-item figure source';
    }
}