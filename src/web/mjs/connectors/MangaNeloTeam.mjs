import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaNeloTeam extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manganeloteam';
        super.label = 'Manga Nelo Team';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://manganeloteam.com';
    }
}