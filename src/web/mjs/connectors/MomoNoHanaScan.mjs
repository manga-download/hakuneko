import WordPressMadaraNovel from './templates/WordPressMadaraNovel.mjs';

export default class MomoNoHanaScan extends WordPressMadaraNovel {

    constructor() {
        super();
        super.id = 'momonohanascan';
        super.label = 'Momo no Hana Scan';
        this.tags = [ 'manga', 'webtoon', 'novel', 'portuguese' ];
        this.url = 'https://momonohanascan.com';

        this.novelObstaclesQuery = 'div#text-chapter-toolbar, div.ad, div.go-to-top';
    }
}