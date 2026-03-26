import WordPressMadara from './templates/WordPressMadara.mjs';

export default class DecadenceScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'decadencescans';
        super.label = 'Decadence';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://reader.decadencescans.com';
    }
}