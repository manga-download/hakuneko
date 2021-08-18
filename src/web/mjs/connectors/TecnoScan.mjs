import WordPressMadara from './templates/WordPressMadara.mjs';

export default class TecnoScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'tecnoscan';
        super.label = 'Tecno Scan';
        this.tags = [ 'webtoon', 'spanish' ];
        this.url = 'https://tecnoscann.com';
    }
}