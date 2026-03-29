import WordPressMadara from './templates/WordPressMadara.mjs';

export default class RagnarokScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'ragnarokscan';
        super.label = 'RagnarokScan';
        this.tags = [ 'webtoon', 'spanish' ];
        this.url = 'https://ragnarokscan.com';
    }
}