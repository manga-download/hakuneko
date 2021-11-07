import WordPressMadara from './templates/WordPressMadara.mjs';

export default class CronosScan extends WordPressMadara {
    constructor() {
        super();
        super.id = 'cronosscan';
        super.label = 'Cronos Scan';
        this.tags = [ 'manga', 'high-quality', 'portuguese', 'scanlation' ];
        this.url = 'https://cronosscan.net';
        this.language = 'pt';
    }
}