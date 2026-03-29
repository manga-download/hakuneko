import WordPressMadara from './templates/WordPressMadara.mjs';

export default class SodaScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'sodascan';
        super.label = 'Soda Scan';
        this.tags = [ 'manga', 'webtoon', 'portuguese', 'scanlation' ];
        this.url = 'https://sodascan.xyz';
    }
}