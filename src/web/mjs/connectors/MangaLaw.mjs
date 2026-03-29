import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaLaw extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangalaw';
        super.label = 'Mangalaw';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://mangalaw.com';
    }
}