import WordPressMadaraNovel from './templates/WordPressMadaraNovel.mjs';

export default class SwordManga extends WordPressMadaraNovel {

    constructor() {
        super();
        super.id = 'swordmanga';
        super.label = 'SwordManga';
        this.tags = [ 'manga', 'webtoon', 'novel', 'spanish' ];
        this.url = 'https://swordmanga.com';

        this.novelObstaclesQuery = 'div#text-chapter-toolbar, div.ad, div.go-to-top';
    }
}