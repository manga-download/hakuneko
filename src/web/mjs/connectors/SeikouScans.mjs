import WordPressMadara from './templates/WordPressMadara.mjs';

export default class SeikouScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'seikouscans';
        super.label = 'Seikou Scans';
        this.tags = ['high-quality', 'portuguese', 'scanlation', 'webtoon' ];
        this.url = 'https://seikouscans.com';
    }
}