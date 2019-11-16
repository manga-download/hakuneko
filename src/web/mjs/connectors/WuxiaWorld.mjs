import WordPressMadaraNovel from './templates/WordPressMadaraNovel.mjs';

export default class WuxiaWorld extends WordPressMadaraNovel {

    constructor() {
        super();
        super.id = 'wuxiaworld';
        super.label = 'WuxiaWorld';
        this.tags = [ 'webtoon', 'novel', 'english' ];
        this.url = 'https://wuxiaworld.site';

        //this.formManga.append('vars[wp-manga-tag]', 'webcomics');
    }
}