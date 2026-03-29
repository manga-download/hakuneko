import WordPressMadara from './templates/WordPressMadara.mjs';

export default class AstralManga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'astralmanga';
        super.label = 'Astral-manga';
        this.tags = [ 'manga', 'webtoons', 'french' ];
        this.url = 'https://astral-manga.fr';
    }
}
