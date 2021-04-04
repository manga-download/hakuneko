import WordPressMadaraNovel from './templates/WordPressMadaraNovel.mjs';

export default class WBNovel extends WordPressMadaraNovel {

    constructor() {
        super();
        super.id = 'wbnovel';
        super.label = 'WBNovel';
        this.tags = [ 'novel', 'indonesian' ];
        this.url = 'https://wbnovel.com';

        this.novelObstaclesQuery = 'div#text-chapter-toolbar, div.ad, div.go-to-top';
    }
}