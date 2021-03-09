import WordPressMadara from './templates/WordPressMadara.mjs';

export default class PMScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'pmscans';
        super.label = 'PMScans';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://www.pmscans.com';
    }
}