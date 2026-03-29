import WordPressMadara from './templates/WordPressMadara.mjs';

export default class DropeScanSensainaYuri extends WordPressMadara {
    constructor() {
        super();
        super.id = 'sensainayuri';
        super.label = 'Sensaina Yuri (Drope Scan)';
        this.tags = [ 'webtoon', 'portuguese', 'scanlation' ];
        this.url = 'https://sensainayuri.dropescan.com';
        this.language = 'pt';
    }
}