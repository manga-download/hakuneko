import WordPressMadara from './templates/WordPressMadara.mjs';

export default class NazarickScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'nazarickscans';
        super.label = 'Nazarick Scans';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://nazarickscans.com';
    }
}