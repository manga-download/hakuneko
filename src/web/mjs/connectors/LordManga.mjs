import WordPressMangastream from './templates/WordPressMadara.mjs';

export default class LordManga extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'lordmanga';
        super.label = 'Lord Manga';
        this.tags = ['webtoon', 'english'];
        this.url = 'https://lordmanga.com/';
    }
}
