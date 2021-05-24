import WordPressMadaraNovel from './templates/WordPressMadaraNovel.mjs';

export default class BananaMecanica extends WordPressMadaraNovel {

    constructor() {
        super();
        super.id = 'bananamecanica';
        super.label = 'Banana Mecânica';
        this.tags = [ 'manga', 'webtoon', 'portuguese', 'scanlation' ];
        this.url = 'https://leitorbm.com';
        this.novelObstaclesQuery = 'div#text-chapter-toolbar, div.ad, div.go-to-top';
    }
}