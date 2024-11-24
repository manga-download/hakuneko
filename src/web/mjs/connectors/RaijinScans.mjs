import WordPressMadara from './templates/WordPressMadara.mjs';

export default class RaijinScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'raijinscans';
        super.label = 'Raijin Scans';
        this.tags = [ 'manga', 'french', 'webtoon' ];
        this.url = 'https://raijinscans.fr';
    }
}