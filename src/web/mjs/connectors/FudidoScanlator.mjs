import WordPressMadaraNovel from './templates/WordPressMadaraNovel.mjs';

export default class FudidoScanlator extends WordPressMadaraNovel {

    constructor() {
        super();
        super.id = 'fudidoscanlator';
        super.label = 'Fudido Scanlator';
        this.tags = [ 'manga', 'webtoon', 'novel', 'portuguese' ];
        this.url = 'https://fudidoscan.com';

        this.novelObstaclesQuery = 'div#text-chapter-toolbar, div.ad, div.go-to-top';
    }
}