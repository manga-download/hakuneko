import WordPressMadara from './templates/WordPressMadara.mjs';

export default class SKSubs extends WordPressMadara {

    constructor() {
        super();
        super.id = 'sksubs';
        super.label = 'Seven King Scanlation';
        this.tags = [ 'webtoon', 'hentai', 'spanish' ];
        this.url = 'https://sksubs.net';
    }
}