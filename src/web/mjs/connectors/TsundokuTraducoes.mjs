import WordPressMadaraNovel from './templates/WordPressMadaraNovel.mjs';

export default class TsundokuTraducoes extends WordPressMadaraNovel {

    constructor() {
        super();
        super.id = 'tsundokutraducoes';
        super.label = 'Tsundoku Traduções';
        this.tags = [ 'webtoon', 'novel', 'portuguese', 'scanlation' ];
        this.url = 'https://tsundokutraducoes.com.br';
        this.novelObstaclesQuery = 'div#text-chapter-toolbar, div.ad, div.go-to-top';
    }
}