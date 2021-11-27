import WordPressMadaraNovel from './templates/WordPressMadaraNovel.mjs';

export default class ArgosScan extends WordPressMadaraNovel {
    constructor() {
        super();
        super.id = 'argosscan';
        super.label = 'Argos Scan';
        this.tags = [ 'manga', 'high-quality', 'portuguese', 'scanlation' ];
        this.url = 'https://argosscan.com';
        this.language = 'pt';

        this.novelObstaclesQuery = 'div#text-chapter-toolbar, div.ad, div.go-to-top';
    }
}