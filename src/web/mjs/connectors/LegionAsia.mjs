import WordPressMadara from './templates/WordPressMadara.mjs';

export default class LegionAsia extends WordPressMadara {

    constructor() {
        super();
        super.id = 'legionasia';
        super.label = 'LegionAsia';
        this.tags = [ 'webtoon', 'spanish' ];
        this.url = 'https://legionasia.com';
    }
}