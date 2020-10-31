import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaArchive extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangaarchive';
        super.label = 'مانجا عرب اون لاين (Manga Archive)';
        this.tags = [ 'webtoon', 'arabic' ];
        this.url = 'https://mangaarabonline.com';
    }
}