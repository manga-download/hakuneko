import WordPressMadara from './templates/WordPressMadara.mjs';

export default class RaiderScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'raiderscans';
        super.label = 'RaiderScans';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://raiderscans.com';
    }
}