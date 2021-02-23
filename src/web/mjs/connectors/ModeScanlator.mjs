import WordPressMadaraNovel from './templates/WordPressMadaraNovel.mjs';

export default class ModeScanlator extends WordPressMadaraNovel {

    constructor() {
        super();
        super.id = 'modescanlator';
        super.label = 'Mode Scanlator';
        this.tags = [ 'webtoon', 'novel', 'portuguese' ];
        this.url = 'https://modescanlator.com';

        this.novelObstaclesQuery = 'div#text-chapter-toolbar, div.ad, div.go-to-top';
    }
}