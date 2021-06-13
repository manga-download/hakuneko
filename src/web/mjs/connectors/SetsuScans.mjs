import WordPressMadara from './templates/WordPressMadara.mjs';

export default class SetsuScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'setsuscans';
        super.label = 'SetsuScans';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://setsuscans.com';
    }
}