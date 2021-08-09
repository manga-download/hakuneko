import WordPressMadara from './templates/WordPressMadara.mjs';

export default class SamuraiScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'samuraiscan';
        super.label = 'Samurai Scan';
        this.tags = [ 'webtoon', 'spanish' ];
        this.url = 'https://samuraiscan.com';
    }
}