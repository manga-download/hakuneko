import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaOnlineTeam extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangaonlineteam';
        super.label = 'Manga Online Team';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://mangaonlineteam.com';
    }
}