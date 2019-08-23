import WordPressMadara from './templates/WordPressMadara.mjs';

/**
 *
 */
export default class CopyPasteScan extends WordPressMadara {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'copypastescan';
        super.label = 'Copy & Paste Scan';
        this.tags = [ 'manga', 'webtoon', 'high-quality', 'spanish', 'scanlation' ];
        this.url = 'https://copypastescan.xyz';
    }
}