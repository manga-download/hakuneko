import WordPressMadara from './templates/WordPressMadara.mjs';

export default class PMScansArchive extends WordPressMadara {

    constructor() {
        super();
        super.id = 'pmscans-archive';
        super.label = 'PMScans (Archive)';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://www.pmscans.com';
    }
}