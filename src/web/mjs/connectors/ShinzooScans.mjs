import WordPressMadara from './templates/WordPressMadara.mjs';
export default class ShinzooScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'shinzooscans';
        super.label = 'Shinzoo Scans';
        this.tags = [ 'manga', 'webtoon', 'portuguese' ];
        this.url = 'https://shinzooscan.xyz';
    }
}