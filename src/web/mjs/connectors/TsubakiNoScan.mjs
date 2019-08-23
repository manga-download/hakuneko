import WordPressMadara from './templates/WordPressMadara.mjs';

/**
 *
 */
export default class TsubakiNoScan extends WordPressMadara {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'tsubakinoscan';
        super.label = 'Tsubaki No Scan';
        this.tags = [ 'webtoon', 'french' ];
        this.url = 'https://tsubakinoscan.com';
    }
}