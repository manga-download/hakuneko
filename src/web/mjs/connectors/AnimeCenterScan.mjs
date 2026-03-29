import WordPressMadaraNovel from './templates/WordPressMadaraNovel.mjs';

export default class AnimeCenterScan extends WordPressMadaraNovel {

    constructor() {
        super();
        super.id = 'animecenterscan';
        super.label = 'Anime Center';
        this.tags = [ 'manga', 'webtoon', 'novel', 'portuguese' ];
        this.url = 'https://animecenterscan.com';

        this.novelObstaclesQuery = 'div#text-chapter-toolbar, div.ad, div.go-to-top';
    }
}