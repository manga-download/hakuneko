import ReadManga from './ReadManga.mjs';

export default class SelfManga extends ReadManga {

    constructor() {
        super();
        super.id = 'selfmanga';
        super.label = 'SelfManga';
        this.tags = [ 'manga', 'russian' ];
        this.url = 'https://selfmanga.ru';

        this.preferSubtitleAsMangaTitle = false;
    }
}