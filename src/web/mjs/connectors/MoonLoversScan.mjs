import WordPressMadaraNovel from './templates/WordPressMadaraNovel.mjs';

export default class MoonLoversScan extends WordPressMadaraNovel {

    constructor() {
        super();
        super.id = 'moonloversscan';
        super.label = 'Moon Lovers Scan';
        this.tags = [ 'webtoon', 'novel', 'portuguese' ];
        this.url = 'https://moonloversscan.com.br';

        this.novelObstaclesQuery = 'div#text-chapter-toolbar, div.ad, div.go-to-top';
    }
}