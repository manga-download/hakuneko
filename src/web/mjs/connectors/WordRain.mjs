import WordPressMadaraNovel from './templates/WordPressMadaraNovel.mjs';

export default class WordRain extends WordPressMadaraNovel {

    constructor() {
        super();
        super.id = 'wordrain';
        super.label = 'Wordrain';
        this.tags = [ 'novel', 'english' ];
        this.url = 'https://wordrain69.com';

        this.novelObstaclesQuery = 'div#text-chapter-toolbar, div.ad, div.ap_container';
    }
}