import WordPressMadara from './templates/WordPressMadara.mjs';

export default class NinjaScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'ninjascan';
        super.label = 'Ninja Scan';
        this.tags = [ 'webtoon', 'portuguese', 'scanlation' ];
        this.url = 'https://ninjascan.xyz';
    }
}