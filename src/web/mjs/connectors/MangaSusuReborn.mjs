import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class MangaSusuReborn extends WordPressMangastream {

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