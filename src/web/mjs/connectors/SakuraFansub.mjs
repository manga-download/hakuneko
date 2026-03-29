import WordPressMadara from './templates/WordPressMadara.mjs';

export default class SakuraFansub extends WordPressMadara {

    constructor() {
        super();
        super.id = 'sakurafansub';
        super.label = 'Sakura Fansub';
        this.tags = [ 'webtoon', 'turkish' ];
        this.url = 'https://sakurafansub.com';
    }
}