import WordPressMadaraNovel from './templates/WordPressMadaraNovel.mjs';

export default class QueensManga extends WordPressMadaraNovel {

    constructor() {
        super();
        super.id = 'queensmanga';
        super.label = 'ملكات المانجا (Queens Manga)';
        this.tags = ['webtoon', 'arabic'];
        this.url = 'https://queensmanga.com';
    }
}