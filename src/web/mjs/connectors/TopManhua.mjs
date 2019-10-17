import WordPressMadara from './templates/WordPressMadara.mjs';

export default class TopManhua extends WordPressMadara {

    constructor() {
        super();
        super.id = 'topmanhua';
        super.label = 'Top Manhua';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://topmanhua.com';
    }
}