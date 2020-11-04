import WordPressMadara from './templates/WordPressMadara.mjs';

export default class QueensManga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'queensmanga';
        super.label = 'ملكات المانجا (Queens Manga)';
        this.tags = [ 'webtoon', 'arabic' ];
        this.url = 'https://queensmanga.com';
    }
}