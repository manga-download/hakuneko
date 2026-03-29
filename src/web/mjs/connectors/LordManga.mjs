import WordPressMadara from './templates/WordPressMadara.mjs';

export default class LordManga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'lordmanga';
        super.label = 'Lord Manga';
        this.tags = ['webtoon', 'english'];
        this.url = 'https://lordmanga.com';
    }
}
