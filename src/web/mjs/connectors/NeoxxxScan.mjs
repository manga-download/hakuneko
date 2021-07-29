import WordPressMadara from './templates/WordPressMadara.mjs';

export default class NeoxScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'neoxxxscan';
        super.label = 'Neoxxx Scanlator';
        this.tags = [ 'hentai', 'manga', 'webtoon', 'portuguese', 'scanlation' ];
        this.url = 'https://xxx.neoxscans.net';
        this.queryTitleForURI = '.post-title';
    }

    canHandleURI(uri) {
        return /https?:\/\/xxx\.neoxscans\.(com|net)/.test(uri.origin);
    }
}
