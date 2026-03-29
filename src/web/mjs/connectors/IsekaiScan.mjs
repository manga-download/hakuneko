import WordPressMadara from './templates/WordPressMadara.mjs';

export default class IsekaiScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'isekaiscan';
        super.label = 'IsekaiScan.to';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://isekaiscan.to';
    }
}
