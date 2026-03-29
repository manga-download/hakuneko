import WordPressMadara from './templates/WordPressMadara.mjs';

export default class SmashScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'smashscan';
        super.label = 'Smash Scan';
        this.tags = [ 'manga', 'portuguese' ];
        this.url = 'https://smashscan.com.br';
    }
}