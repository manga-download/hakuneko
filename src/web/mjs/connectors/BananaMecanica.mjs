import WordPressMadaraNovel from './templates/WordPressMadaraNovel.mjs';

export default class BananaMecanica extends WordPressMadaraNovel {

    constructor() {
        super();
        super.id = 'bananamecanica';
        super.label = 'Banana Cítrica';
        this.tags = [ 'manga', 'webtoon', 'portuguese', 'scanlation' ];
        this.url = 'https://dinastiacilly.com';
        this.novelObstaclesQuery = 'div#text-chapter-toolbar, div.ad, div.go-to-top';
    }
}