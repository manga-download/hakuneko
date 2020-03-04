import WordPressMadara from './templates/WordPressMadara.mjs';

export default class BestManga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'bestmanga';
        super.label = 'Best Manga';
        this.tags = [ 'manga', 'webtoon', 'russian' ];
        this.url = 'https://bestmanga.club';
    }
}