import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaKomi extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangakomi';
        super.label = 'Manga Komi';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://mangakomi.com';
    }
}