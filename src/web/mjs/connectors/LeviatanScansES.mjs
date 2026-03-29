import WordPressMadara from './templates/WordPressMadara.mjs';

export default class LeviatanScansES extends WordPressMadara {

    constructor() {
        super();
        super.id = 'leviatanscans-es';
        super.label = 'LeviatanScans (Spanish)';
        this.tags = [ 'webtoon', 'high-quality', 'spanish', 'scanlation' ];
        this.url = 'https://es.leviatanscans.com';
    }
}