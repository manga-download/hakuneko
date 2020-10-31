import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaLandArabic extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangalandarabic';
        super.label = 'مانجا لاند عربي (Manga Land Arabic)';
        this.tags = [ 'webtoon', 'arabic' ];
        this.url = 'https://mangalandarabic.com';
    }
}