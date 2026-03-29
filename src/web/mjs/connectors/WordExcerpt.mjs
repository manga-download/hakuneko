import WordPressMadaraNovel from './templates/WordPressMadaraNovel.mjs';
//pretty sure it aint madara anymore
export default class WordExcerpt extends WordPressMadaraNovel {

    constructor() {
        super();
        super.id = 'wordexcerpt';
        super.label = 'Word Excerpt';
        this.tags = [ 'webtoon', 'novel', 'english' ];
        this.url = 'https://wordexcerpt.com';
        this.links = {
            login: 'https://wordexcerpt.com/login/'
        };

        this.novelObstaclesQuery = 'div#text-chapter-toolbar, div.ad, div.go-to-top';
    }
}