import WordPressMadaraNovel from './templates/WordPressMadaraNovel.mjs';

export default class Lindovel extends WordPressMadaraNovel {

    constructor() {
        super();
        super.id = 'lindovel';
        super.label = 'Lindovel';
        this.tags = [ 'novel', 'indonesian' ];
        this.url = 'https://lindovel.com';

        this.novelObstaclesQuery = 'div#text-chapter-toolbar, div.go-to-top, p[style*="color:red"]';
    }
}