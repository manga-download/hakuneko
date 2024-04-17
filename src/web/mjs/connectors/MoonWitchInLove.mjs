import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MoonWitchInLove extends WordPressMadara {

    constructor() {
        super();
        super.id = 'moonwitchinlove';
        super.label = 'Moon Witch In Love';
        this.tags = [ 'webtoon', 'portuguese', 'scanlation' ];
        this.url = 'https://moonwitchinlovescan.com';
    }
}
