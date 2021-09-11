import WordPressMadara from './templates/WordPressMadara.mjs';

export default class GloryScansHentai extends WordPressMadara {

    constructor() {
        super();
        super.id = 'gloryscanshentai';
        super.label = 'Glory Scans Hentai';
        this.tags = [ 'hentai', 'manga', 'webtoon', 'portuguese', 'scanlation' ];
        this.url = 'https://hentai.gloryscan.com';
    }
}
