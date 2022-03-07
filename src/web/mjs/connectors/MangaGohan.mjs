import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaGohan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangagohan';
        super.label = 'Manga Gohan';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://mangagohan.com';
    }
}