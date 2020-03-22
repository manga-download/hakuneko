import WordPressMadaraNovel from './templates/WordPressMadaraNovel.mjs';

export default class AstralLibrary extends WordPressMadaraNovel {

    constructor() {
        super();
        super.id = 'astrallibrary';
        super.label = 'Astral Library';
        this.tags = [ 'webtoon', 'novel', 'english' ];
        this.url = 'https://astrallibrary.net';

        this.novelObstaclesQuery = 'div.ad';
    }
}