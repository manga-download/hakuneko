import WordPressMadaraNovel from './templates/WordPressMadaraNovel.mjs';

export default class KolNovel extends WordPressMadaraNovel {

    constructor() {
        super();
        super.id = 'kolnovel';
        super.label = 'Kol Novel (ملوك الروايات)';
        this.tags = [ 'manga', 'webtoon', 'arabic' ];
        this.url = 'https://kolnovel.com';

        this.novelObstaclesQuery = 'div#text-chapter-toolbar, div#ucare-quick-link-widget, div.kolno-after-content';
    }
}