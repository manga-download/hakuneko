import WordPressMadara from './templates/WordPressMadara.mjs';

export default class GekkouScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'gekkouscans';
        super.label = 'Gekkou Scans';
        this.tags = [ 'manga', 'webtoon', 'portuguese' ];
        this.url = 'https://gekkou.site';
    }
}
