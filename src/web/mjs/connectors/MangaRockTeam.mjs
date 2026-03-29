import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaRockTeam extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangarockteam';
        super.label = 'Manga Rock Team';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://mangarockteam.com';
    }
}