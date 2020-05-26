import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaDiyari extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangadiyari';
        super.label = 'MangaDiyari';
        this.tags = [ 'manga', 'webtoon', 'turkish' ];
        this.url = 'https://mangadiyari.com';
    }
}