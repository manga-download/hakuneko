import WordPressMadara from './templates/WordPressMadara.mjs';
export default class PairOfTwo extends WordPressMadara {

    constructor() {
        super();
        super.id = 'pairoftwo';
        super.label = 'Pair of 2';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://po2scans.com';
    }
}
