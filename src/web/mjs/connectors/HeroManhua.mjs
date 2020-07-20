import WordPressMadara from './templates/WordPressMadara.mjs';

export default class HeroManhua extends WordPressMadara {

    constructor() {
        super();
        super.id = 'heromanhua';
        super.label = 'Hero Manhua';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://heromanhua.com';
    }
}