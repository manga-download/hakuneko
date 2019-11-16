import WordPressMadara from './templates/WordPressMadara.mjs';

export default class TritiniaScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'tritiniascans';
        super.label = 'Tritinia Scans';
        this.tags = [ 'webtoon', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://ghajik.ml';
    }
}