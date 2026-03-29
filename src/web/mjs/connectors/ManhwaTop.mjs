import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ManhwaTop extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manhwatop';
        super.label = 'MANHWATOP';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://manhwatop.com';
    }
}