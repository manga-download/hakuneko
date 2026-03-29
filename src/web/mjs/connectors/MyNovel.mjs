import WordPressMadaraNovel from './templates/WordPressMadaraNovel.mjs';

export default class MyNovel extends WordPressMadaraNovel {

    constructor() {
        super();
        super.id = 'mynovel';
        super.label = 'MyNovel';
        this.tags = [ 'novel', 'indonesian' ];
        this.url = 'https://www.mynovel.my.id';

        this.novelObstaclesQuery = 'div.addtoany_content';
    }
}