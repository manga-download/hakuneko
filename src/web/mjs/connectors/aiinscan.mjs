import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Aiinscan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'aiinscan';
        super.label = 'Aiinscan';
        this.tags = [ 'manga', 'high-quality', 'portuguese', 'scanlation' ];
        this.url = 'https://aiinscan.xyz';
        this.language = 'pt';
    }
}