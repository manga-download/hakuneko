import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Eclypse extends WordPressMadara {

    constructor() {
        super();
        super.id = 'eclypse';
        super.label = 'Eclypse';
        this.tags = [ 'manga', 'scanlation', 'webtoons', 'french' ];
        this.url = 'https://eclypse-scan.com';
    }
}
