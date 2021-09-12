import WordPressMadara from './templates/WordPressMadara.mjs';

export default class NeoxScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'neoxscan';
        super.label = 'Neox Scanlator';
        this.tags = [ 'manga', 'webtoon', 'portuguese', 'scanlation' ];
        this.url = 'https://neoxscans.net';
        this.queryTitleForURI = '.post-title';
    }
    canHandleURI(uri) {
        return /https?:\/\/neoxscans\.(com|net)/.test(uri.origin);
    }
}