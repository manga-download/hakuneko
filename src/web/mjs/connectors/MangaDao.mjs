import WordPressMadaraNovel from './templates/WordPressMadaraNovel.mjs';

export default class MangaDao extends WordPressMadaraNovel {

    constructor() {
        super();
        super.id = 'mangadao';
        super.label = 'Manga Dao';
        this.tags = [ 'webtoon', 'novel', 'english' ];
        this.url = 'https://mangadao.com';

        this.novelObstaclesQuery = 'div#text-chapter-toolbar';
    }
}