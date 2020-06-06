import WordPressEManga from './templates/WordPressEManga.mjs';

export default class MangaSusuReborn extends WordPressEManga {

    constructor() {
        super();
        super.id = 'mangasusureborn';
        super.label = 'MangaSusu Reborn';
        this.tags = [ 'manga', 'webtoon', 'indonesian' ];
        this.url = 'https://mangasusu.fun';
        this.path = '/manga/?list';

        this.queryChapters = 'div.bxcl ul li span.lchx a';
    }
}