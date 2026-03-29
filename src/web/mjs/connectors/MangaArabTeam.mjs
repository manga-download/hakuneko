import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaArabTeam extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangaarabteam';
        super.label = 'مانجا عرب تيم (Manga Arab Team)';
        this.tags = [ 'manga', 'webtoon', 'arabic' ];
        this.url = 'https://mangaarabteam.com';
    }
}