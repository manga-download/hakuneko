import WordPressMadara from './templates/WordPressMadara.mjs';

export default class WonderlandWebtoons extends WordPressMadara {

    constructor() {
        super();
        super.id = 'wonderlandwebtoons';
        super.label = 'Wonderland - Land Webtoons';
        this.tags = [ 'webtoon', 'portuguese' ];
        this.url = 'https://landwebtoons.site';
    }
}