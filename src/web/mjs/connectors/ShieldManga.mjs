import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ShieldManga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'shieldmanga';
        super.label = 'Shield Manga';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://shieldmanga.club';

        this.queryChapters = 'li.wp-manga-chapter > a, li.wp-manga-hapter > a';
        this.queryPages = 'div.page-break source, div.page-beak source';
    }
}