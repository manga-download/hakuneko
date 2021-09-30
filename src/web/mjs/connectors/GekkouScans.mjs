import WordPressMadara from './templates/WordPressMadara.mjs';

export default class GekkouScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'gekkouscans';
        super.label = 'Gekkou Scans';
        this.tags = [ 'manga', 'webtoon', 'portuguese', 'scanlation' ];
        this.url = 'https://gekkouscans.com.br';
        this.language = 'portuguese';
        this.queryChapters = 'li.wp-manga-chapter a';
    }
}