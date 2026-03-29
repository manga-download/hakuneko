import WordPressMadara from './templates/WordPressMadara.mjs';

export default class PlatinumScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'platinumscans';
        super.label = 'PlatinumScans';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://platinumscans.com';
    }
}