import WordPressMadara from './templates/WordPressMadara.mjs';

export default class FirstKissManhua extends WordPressMadara {

    constructor() {
        super();
        super.id = '1stkissmanhua';
        super.label = '1st Kiss Manhua';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://1stkissmanhua.com';
    }
}