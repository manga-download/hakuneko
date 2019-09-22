import WordPressMadara from './templates/WordPressMadara.mjs';

export default class HunterFansub extends WordPressMadara {

    constructor() {
        super();
        super.id = 'hunterfansub';
        super.label = 'Hunter Fansub';
        this.tags = [ 'webtoon', 'high-quality', 'spanish', 'scanlation' ];
        this.url = 'https://hunterfansub.com';
    }
}