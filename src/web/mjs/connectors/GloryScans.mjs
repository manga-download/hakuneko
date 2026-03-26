import WordPressMadaraNovel from './templates/WordPressMadaraNovel.mjs';

export default class GloryScans extends WordPressMadaraNovel {

    constructor() {
        super();
        super.id = 'gloryscans';
        super.label = 'Glory Scans';
        this.tags = [ 'webtoon', 'novel', 'portuguese' ];
        this.url = 'https://gloryscan.com';

        this.novelObstaclesQuery = 'div#text-chapter-toolbar, div.ad, div.go-to-top';
    }
}