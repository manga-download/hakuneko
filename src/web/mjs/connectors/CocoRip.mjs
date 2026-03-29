import WordPressMadara from './templates/WordPressMadara.mjs';

export default class CocoRip extends WordPressMadara {

    constructor() {
        super();
        super.id = 'cocorip';
        super.label = 'CocoRip';
        this.tags = [ 'manga', 'spanish', 'webtoon' ];
        this.url = 'https://cocorip.net';
    }
}