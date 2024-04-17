import WordPressMadara from './templates/WordPressMadara.mjs';

export default class winterscan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'winterscan';
        super.label = 'Winter Scan';
        this.tags = [ 'webtoon', 'portuguese', 'scanlation' ];
        this.url = 'https://winterscan.com';
    }
}
