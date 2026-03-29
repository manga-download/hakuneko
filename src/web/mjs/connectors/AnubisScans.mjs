import WordPressMadara from './templates/WordPressMadara.mjs';

export default class AnubisScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'anubisscans';
        super.label = 'Anubis Scans';
        this.tags = [ 'webtoon', 'turkish' ];
        this.url = 'https://anubisscans.com';
    }
}
