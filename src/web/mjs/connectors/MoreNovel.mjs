import WordPressMadaraNovel from './templates/WordPressMadaraNovel.mjs';

export default class MoreNovel extends WordPressMadaraNovel {

    constructor() {
        super();
        super.id = 'morenovel';
        super.label = 'Morenovel';
        this.tags = [ 'novel', 'indonesian' ];
        this.url = 'https://risenovel.com';

        this.novelObstaclesQuery = 'div#text-chapter-toolbar, div.ad, div.go-to-top';
    }
}
