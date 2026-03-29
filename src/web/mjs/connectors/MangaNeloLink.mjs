import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaNeloLink extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manganelolink';
        super.label = 'Manga Nelo Link';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://manganelo.link';
    }
}