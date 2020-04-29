import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ShosetsuManga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'shosetsumanga';
        super.label = 'Shosetsu Manga';
        this.tags = [ 'hentai', 'english' ];
        this.url = 'https://www.shosetsu-manga.org';
    }
}