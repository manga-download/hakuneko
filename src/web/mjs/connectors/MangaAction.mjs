import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaAction extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangaaction';
        super.label = 'مانجا اكشن (Manga Action)';
        this.tags = [ 'manga', 'webtoon', 'arabic' ];
        this.url = 'https://manga-action.com';
    }
}