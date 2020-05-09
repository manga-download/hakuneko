import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ArgosScan extends WordPressMadara {
    constructor() {
        super();
        super.id = 'argosscan';
        super.label = 'Argos Scan';
        this.tags = [ 'manga', 'high-quality', 'portuguese', 'scanlation' ];
        this.url = 'https://argosscan.com';
        this.language = 'pt';
    }
}