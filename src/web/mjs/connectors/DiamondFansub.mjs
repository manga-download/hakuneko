import WordPressMadara from './templates/WordPressMadara.mjs';

export default class DiamondFansub extends WordPressMadara {

    constructor() {
        super();
        super.id = 'diamondfansub';
        super.label = 'DiamondFansub';
        this.tags = [ 'webtoon', 'turkish' ];
        this.url = 'https://diamondfansub.com';
    }
}