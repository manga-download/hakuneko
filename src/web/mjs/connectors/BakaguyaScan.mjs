import WordPressMadara from './templates/WordPressMadara.mjs';

export default class BakaguyaScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'bakaguyascan';
        super.label = 'Bakaguya Scan';
        this.tags = [ 'manga', 'spanish', 'scanlation' ];
        this.url = 'https://bakaguya-scan.tk';
    }
}