import WordPressMadara from './templates/WordPressMadara.mjs';

export default class CeriseScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'cerisescans';
        super.label = 'Cerise Scans';
        this.tags = [ 'webtoon', 'portuguese', 'scanlation' ];
        this.url = 'https://cerisescans.com';
    }
}