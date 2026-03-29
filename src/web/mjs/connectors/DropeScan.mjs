import WordPressMadara from './templates/WordPressMadara.mjs';

export default class DropeScan extends WordPressMadara {
    constructor() {
        super();
        super.id = 'dropescan';
        super.label = 'Drope Scan';
        this.tags = [ 'manga', 'portuguese', 'scanlation' ];
        this.url = 'https://dropescan.com';
        this.language = 'pt';
    }
}