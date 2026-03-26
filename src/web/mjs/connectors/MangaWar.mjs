import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaWar extends WordPressMadara {
    constructor() {
        super();
        super.id = 'mangawar';
        super.label = 'Manga War';
        this.tags = [ 'manga', 'high-quality', 'english' ];
        this.url = 'https://mangawar.com';
        this.language = 'en';
    }
}