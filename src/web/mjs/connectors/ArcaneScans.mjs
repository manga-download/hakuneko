import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ArcaneScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'arcanescans';
        super.label = 'Arcane Scans';
        this.tags = [ 'manga', 'english', 'webtoon', 'scanlation' ];
        this.url = 'https://arcanescans.com';
    }
}